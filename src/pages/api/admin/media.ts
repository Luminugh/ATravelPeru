import type { APIRoute } from "astro";
import {
  createSupabaseAuthedClient,
  createSupabaseServiceClient,
} from "../../../infrastructure/supabase/AdminAuthClientFactory";
import { ADMIN_ACCESS_COOKIE } from "../../../domain/services/SessionService";

const STORAGE_BUCKET = import.meta.env.PUBLIC_SUPABASE_MEDIA_BUCKET ?? import.meta.env.SUPABASE_MEDIA_BUCKET ?? 'media';

function guessExtensionFromMimeType(mimeType: string | null | undefined) {
  switch ((mimeType || '').toLowerCase()) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/gif':
      return '.gif';
    case 'image/webp':
      return '.webp';
    case 'image/svg+xml':
      return '.svg';
    case 'image/avif':
      return '.avif';
    case 'image/bmp':
      return '.bmp';
    case 'image/tiff':
      return '.tiff';
    default:
      return '';
  }
}

function getFilenameFromUrl(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    const pathname = url.pathname.split('/').filter(Boolean).pop() || '';
    if (pathname) {
      return decodeURIComponent(pathname.split('?')[0].split('#')[0]);
    }
  } catch {
    // Fall through to default filename below.
  }

  return '';
}

function normalizeTourGallery(galeria: unknown): string[] {
  if (!Array.isArray(galeria)) {
    return [];
  }

  return galeria
    .map((item) => {
      if (typeof item === 'string') {
        return item;
      }
      if (item && typeof item === 'object') {
        const galleryItem = item as { imagen?: string; url?: string; publicUrl?: string };
        return galleryItem.imagen ?? galleryItem.url ?? galleryItem.publicUrl ?? null;
      }
      return null;
    })
    .filter((url): url is string => Boolean(url));
}

function collectTourImageUrls(tours: Array<{ imagen_principal?: string | null; galeria?: unknown }>) {
  const urls = new Set<string>();

  for (const tour of tours) {
    if (tour.imagen_principal) {
      urls.add(tour.imagen_principal);
    }

    for (const galleryUrl of normalizeTourGallery(tour.galeria)) {
      urls.add(galleryUrl);
    }
  }

  return [...urls];
}

async function uploadFileToMediaTable({
  authClient,
  userId,
  file,
  alt_text,
  tags,
}: {
  authClient: any;
  userId: string;
  file: File;
  alt_text: string | null;
  tags: string[];
}) {
  const filename = file.name ?? `upload-${Date.now()}`;
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `uploads/${userId}/${Date.now()}-${safeName}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const storageClient = createSupabaseServiceClient();
  const uploadRes = await storageClient.storage.from(STORAGE_BUCKET).upload(storagePath, buffer, { contentType: file.type });
  if (uploadRes.error) {
    console.error(`Storage upload error (${STORAGE_BUCKET}):`, uploadRes.error);
    if (uploadRes.error.status === 404) {
      return jsonResponse({ ok: false, error: `Bucket not found: ${STORAGE_BUCKET}. Create the bucket in Supabase Storage or set PUBLIC_SUPABASE_MEDIA_BUCKET.` }, 500);
    }
    return jsonResponse({ ok: false, error: `Storage upload failed: ${uploadRes.error.message}` }, 500);
  }

  const { data: urlData } = storageClient.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
  const publicUrl = (urlData as any)?.publicUrl ?? null;

  const insertRes = await authClient
    .from('media_files')
    .insert({
      storage_path: storagePath,
      url: publicUrl,
      filename,
      mime_type: file.type,
      size: buffer.length,
      alt_text,
      tags,
      uploader: userId,
    })
    .select()
    .single();

  if (insertRes.error) {
    console.error('DB insert error:', insertRes.error);
    return jsonResponse({ ok: false, error: insertRes.error.message }, 500);
  }

  return jsonResponse({ ok: true, data: insertRes.data }, 201);
}

async function resolveImageFileFromUrl(rawUrl: string, baseUrl: string) {
  let resolvedUrl: URL;
  try {
    resolvedUrl = new URL(rawUrl, baseUrl);
  } catch {
    return { error: 'El enlace de imagen no es válido' } as const;
  }

  if (!['http:', 'https:'].includes(resolvedUrl.protocol)) {
    return { error: 'El enlace debe usar http o https' } as const;
  }

  const remoteRes = await fetch(resolvedUrl.toString());
  if (!remoteRes.ok) {
    return { error: `No se pudo descargar la imagen (${remoteRes.status})` } as const;
  }

  const remoteContentType = remoteRes.headers.get('content-type') || '';
  if (!remoteContentType.startsWith('image/')) {
    return { error: 'El enlace no apunta a una imagen válida' } as const;
  }

  const remoteBuffer = Buffer.from(await remoteRes.arrayBuffer());
  const remoteName = getFilenameFromUrl(rawUrl) || `image-${Date.now()}${guessExtensionFromMimeType(remoteContentType)}`;

  return {
    file: new File([remoteBuffer], remoteName, { type: remoteContentType }),
    sourceUrl: resolvedUrl.toString(),
  } as const;
}

async function syncTourImages({ authClient, userId, requestUrl }: { authClient: any; userId: string; requestUrl: string }) {
  const storageClient = createSupabaseServiceClient();

  const [toursRes, mediaRes] = await Promise.all([
    authClient
      .from('v_tours_catalogo')
      .select('imagen_principal,galeria')
      .order('id', { ascending: true }),
    authClient
      .from('media_files')
      .select('url')
      .not('url', 'is', null),
  ]);

  if (toursRes.error) {
    return jsonResponse({ ok: false, error: toursRes.error.message }, 500);
  }

  if (mediaRes.error) {
    return jsonResponse({ ok: false, error: mediaRes.error.message }, 500);
  }

  const existingUrls = new Set(
    (mediaRes.data ?? [])
      .map((row: { url?: string | null }) => row.url?.trim())
      .filter((url: string | undefined): url is string => Boolean(url))
  );

  const candidateUrls = collectTourImageUrls(toursRes.data ?? []);
  let created = 0;
  let skippedExisting = 0;
  let skippedInvalid = 0;
  const errors: string[] = [];

  for (const rawUrl of candidateUrls) {
    const normalizedUrl = rawUrl.trim();
    if (!normalizedUrl) {
      skippedInvalid += 1;
      continue;
    }

    if (existingUrls.has(normalizedUrl)) {
      skippedExisting += 1;
      continue;
    }

    const resolved = await resolveImageFileFromUrl(normalizedUrl, requestUrl);
    if ('error' in resolved) {
      skippedInvalid += 1;
      errors.push(`${normalizedUrl}: ${resolved.error}`);
      continue;
    }

    const uploadOutcome = await uploadFileToMediaTable({
      authClient,
      userId,
      file: resolved.file,
      alt_text: null,
      tags: [],
    });

    if (uploadOutcome.status !== 201) {
      const payload = await uploadOutcome.json().catch(() => null);
      errors.push(`${normalizedUrl}: ${payload?.error || 'No se pudo guardar la imagen'}`);
      continue;
    }

    created += 1;
    existingUrls.add(normalizedUrl);
  }

  return jsonResponse({
    ok: true,
    data: {
      created,
      skippedExisting,
      skippedInvalid,
      totalCandidates: candidateUrls.length,
      errors: errors.slice(0, 20),
    },
  });
}

export const prerender = false;

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function getAuthenticatedClient(cookies: Parameters<APIRoute>[0]["cookies"]) {
  const accessToken = cookies.get(ADMIN_ACCESS_COOKIE)?.value;
  if (!accessToken) {
    return { error: jsonResponse({ ok: false, error: "No autenticado" }, 401) } as const;
  }

  const client = createSupabaseAuthedClient(accessToken);
  const { data, error } = await client.auth.getUser(accessToken);

  if (error || !data?.user) {
    return { error: jsonResponse({ ok: false, error: "Sesión inválida" }, 401) } as const;
  }

  return { client, userId: data.user.id } as const;
}

async function isAdmin(userId: string, authClient?: any): Promise<boolean> {
  // Prefer service client (no RLS) when available. If service key is missing
  // (e.g., in some local setups) fall back to the authenticated client.
  try {
    let data: any = null;
    let error: any = null;

    try {
      const serviceClient = createSupabaseServiceClient();
      const res = await serviceClient
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
      data = res.data;
      error = res.error;
    } catch (svcErr) {
      // Service client unavailable (missing env) — we'll try authClient below.
      data = null;
      error = svcErr;
    }

    if (error || !data) {
      if (!authClient) return false;
      const res2 = await authClient
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
      if (res2.error || !res2.data) return false;
      return res2.data.role === 'admin';
    }

    return data.role === 'admin';
  } catch (err) {
    return false;
  }
}

export const GET: APIRoute = async ({ cookies, request }) => {
  try {
    const auth = await getAuthenticatedClient(cookies);
    if ("error" in auth) return auth.error;

    // Check admin status (pass auth client as fallback for local/dev)
    const admin = await isAdmin(auth.userId, auth.client);
    if (!admin) {
      return jsonResponse({ ok: false, error: "No autorizado: permisos de administrador requeridos" }, 403);
    }

    const res = await auth.client
      .from('media_files')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    
    if (res.error) {
      return jsonResponse({ ok: false, error: res.error.message }, 500);
    }
    
    return jsonResponse({ ok: true, data: res.data });
  } catch (err) {
    console.error('GET /api/admin/media error:', err);
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : 'Error interno' }, 500);
  }
};

export const POST: APIRoute = async ({ cookies, request }) => {
  try {
    const auth = await getAuthenticatedClient(cookies);
    if ("error" in auth) return auth.error;

    // Check admin status (pass auth client as fallback for local/dev)
    const admin = await isAdmin(auth.userId, auth.client);
    if (!admin) {
      return jsonResponse({ ok: false, error: "No autorizado: permisos de administrador requeridos" }, 403);
    }

    const syncRequested = new URL(request.url).searchParams.get('sync') === '1';
    if (syncRequested) {
      return syncTourImages({ authClient: auth.client, userId: auth.userId, requestUrl: request.url });
    }

    const form = await request.formData();
    const file = form.get('file') as File | null;
    const imageUrlRaw = ((form.get('image_url') as string) || '').trim();
    const alt_text = (form.get('alt_text') as string) || null;
    const tagsRaw = (form.get('tags') as string) || null;
    const tags = tagsRaw ? tagsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

    if (!file && !imageUrlRaw) return jsonResponse({ ok: false, error: 'No se recibió archivo ni enlace de imagen' }, 400);

    let uploadFile = file;

    if (!uploadFile) {
      const resolved = await resolveImageFileFromUrl(imageUrlRaw, request.url);
      if ('error' in resolved) {
        return jsonResponse({ ok: false, error: resolved.error }, 400);
      }

      uploadFile = resolved.file;
    }

    return uploadFileToMediaTable({
      authClient: auth.client,
      userId: auth.userId,
      file: uploadFile,
      alt_text,
      tags,
    });
  } catch (err) {
    console.error('POST /api/admin/media error:', err);
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : 'Error interno' }, 500);
  }
};

export const DELETE: APIRoute = async ({ cookies, request }) => {
  try {
    const auth = await getAuthenticatedClient(cookies);
    if ("error" in auth) return auth.error;

    // Check admin status (pass auth client as fallback for local/dev)
    const admin = await isAdmin(auth.userId, auth.client);
    if (!admin) {
      return jsonResponse({ ok: false, error: "No autorizado: permisos de administrador requeridos" }, 403);
    }

    const body = await request.json().catch(() => null);
    const id = (body as { id?: string } | null)?.id;
    if (!id) return jsonResponse({ ok: false, error: 'ID requerido' }, 400);

    // Get record
    const getRes = await auth.client
      .from('media_files')
      .select('*')
      .eq('id', id)
      .single();
    
    if (getRes.error) {
      return jsonResponse({ ok: false, error: getRes.error.message }, 500);
    }
    
    const row = getRes.data as any;
    if (!row) return jsonResponse({ ok: false, error: 'No encontrado' }, 404);

    const storageClient = createSupabaseServiceClient();

    // Delete from storage
    const removeRes = await storageClient.storage.from(STORAGE_BUCKET).remove([row.storage_path]);
    if (removeRes.error) {
      console.error(`Storage delete error (${STORAGE_BUCKET}):`, removeRes.error);
      if (removeRes.error.status === 404) {
        return jsonResponse({ ok: false, error: `Bucket not found: ${STORAGE_BUCKET}. Create the bucket in Supabase Storage or set PUBLIC_SUPABASE_MEDIA_BUCKET.` }, 500);
      }
      return jsonResponse({ ok: false, error: `Storage delete failed: ${removeRes.error.message}` }, 500);
    }

    // Delete DB row
    const delRes = await auth.client
      .from('media_files')
      .delete()
      .eq('id', id);
    
    if (delRes.error) {
      return jsonResponse({ ok: false, error: delRes.error.message }, 500);
    }

    return jsonResponse({ ok: true });
  } catch (err) {
    console.error('DELETE /api/admin/media error:', err);
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : 'Error interno' }, 500);
  }
};
