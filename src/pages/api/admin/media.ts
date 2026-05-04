import type { APIRoute } from "astro";
import {
  createSupabaseAuthedClient,
  createSupabaseServiceClient,
} from "../../../infrastructure/supabase/AdminAuthClientFactory";
import { ADMIN_ACCESS_COOKIE } from "../../../domain/services/SessionService";

const STORAGE_BUCKET = import.meta.env.PUBLIC_SUPABASE_MEDIA_BUCKET ?? import.meta.env.SUPABASE_MEDIA_BUCKET ?? 'media';

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

async function isAdmin(client: any, userId: string): Promise<boolean> {
  try {
    const { data, error } = await client
      .from('users')
      .select('role')
      .eq('id', userId)
      .eq('role', 'admin')
      .single();
    
    if (error || !data) return false;
    return true;
  } catch (err) {
    return false;
  }
}

export const GET: APIRoute = async ({ cookies, request }) => {
  try {
    const auth = await getAuthenticatedClient(cookies);
    if ("error" in auth) return auth.error;

    // Check admin status
    const admin = await isAdmin(auth.client, auth.userId);
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

    // Check admin status
    const admin = await isAdmin(auth.client, auth.userId);
    if (!admin) {
      return jsonResponse({ ok: false, error: "No autorizado: permisos de administrador requeridos" }, 403);
    }

    const form = await request.formData();
    const file = form.get('file') as File | null;
    const alt_text = (form.get('alt_text') as string) || null;
    const tagsRaw = (form.get('tags') as string) || null;
    const tags = tagsRaw ? tagsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

    if (!file) return jsonResponse({ ok: false, error: 'No se recibió archivo' }, 400);

    const filename = file.name ?? `upload-${Date.now()}`;
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `uploads/${auth.userId}/${Date.now()}-${safeName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const storageClient = createSupabaseServiceClient();

    // Upload to Supabase Storage bucket
    const uploadRes = await storageClient.storage.from(STORAGE_BUCKET).upload(storagePath, buffer, { contentType: file.type });
    if (uploadRes.error) {
      console.error(`Storage upload error (${STORAGE_BUCKET}):`, uploadRes.error);
      if (uploadRes.error.status === 404) {
        return jsonResponse({ ok: false, error: `Bucket not found: ${STORAGE_BUCKET}. Create the bucket in Supabase Storage or set PUBLIC_SUPABASE_MEDIA_BUCKET.` }, 500);
      }
      return jsonResponse({ ok: false, error: `Storage upload failed: ${uploadRes.error.message}` }, 500);
    }

    // Get public URL
    const { data: urlData } = storageClient.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
    const publicUrl = (urlData as any)?.publicUrl ?? null;

    // Insert metadata row
    const insertRes = await auth.client
      .from('media_files')
      .insert({
        storage_path: storagePath,
        url: publicUrl,
        filename: filename,
        mime_type: file.type,
        size: buffer.length,
        alt_text,
        tags,
        uploader: auth.userId,
      })
      .select()
      .single();

    if (insertRes.error) {
      console.error('DB insert error:', insertRes.error);
      return jsonResponse({ ok: false, error: insertRes.error.message }, 500);
    }

    return jsonResponse({ ok: true, data: insertRes.data }, 201);
  } catch (err) {
    console.error('POST /api/admin/media error:', err);
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : 'Error interno' }, 500);
  }
};

export const DELETE: APIRoute = async ({ cookies, request }) => {
  try {
    const auth = await getAuthenticatedClient(cookies);
    if ("error" in auth) return auth.error;

    // Check admin status
    const admin = await isAdmin(auth.client, auth.userId);
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
