import type { APIRoute } from "astro";
import { GetVendorToursUseCase } from "../../../application/use-cases/GetVendorToursUseCase";
import { CreateTourUseCase } from "../../../application/use-cases/CreateTourUseCase";
import { UpdateTourUseCase } from "../../../application/use-cases/UpdateTourUseCase";
import { DeleteTourUseCase } from "../../../application/use-cases/DeleteTourUseCase";
import { createSupabaseAuthedClient } from "../../../infrastructure/supabase/AdminAuthClientFactory";
import { ADMIN_ACCESS_COOKIE } from "../../../domain/services/SessionService";
import { UnauthorizedError, ValidationError } from "../../../domain/errors/DomainError";

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
    return { error: jsonResponse({ ok: false, error: "Sesion invalida" }, 401) } as const;
  }

  return {
    client,
    userId: data.user.id,
  } as const;
}

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const auth = await getAuthenticatedClient(cookies);
    if ("error" in auth) {
      return auth.error;
    }

    const getVendorToursUseCase = new GetVendorToursUseCase(auth.client);
    const items = await getVendorToursUseCase.execute();
    return jsonResponse({ ok: true, data: items });
  } catch (error) {
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : "Error interno del servidor" }, 500);
  }
};

export const POST: APIRoute = async ({ cookies, request }) => {
  try {
    const auth = await getAuthenticatedClient(cookies);
    if ("error" in auth) {
      return auth.error;
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return jsonResponse({ ok: false, error: "Payload invalido" }, 400);
    }

    const createTourUseCase = new CreateTourUseCase(auth.client);
    const result = await createTourUseCase.execute(auth.userId, body as Record<string, unknown>);
    return jsonResponse({ ok: true, data: result }, 201);
  } catch (error) {
    const status = error instanceof ValidationError ? 400 : 500;
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : "Error interno del servidor" }, status);
  }
};

export const PUT: APIRoute = async ({ cookies, request }) => {
  try {
    const auth = await getAuthenticatedClient(cookies);
    if ("error" in auth) {
      return auth.error;
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return jsonResponse({ ok: false, error: "Payload invalido" }, 400);
    }

    const updateTourUseCase = new UpdateTourUseCase(auth.client);
    await updateTourUseCase.execute(body as Record<string, unknown>);
    return jsonResponse({ ok: true });
  } catch (error) {
    const status = error instanceof ValidationError ? 400 : 500;
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : "Error interno del servidor" }, status);
  }
};

export const DELETE: APIRoute = async ({ cookies, request }) => {
  try {
    const auth = await getAuthenticatedClient(cookies);
    if ("error" in auth) {
      return auth.error;
    }

    const body = await request.json().catch(() => null);
    const id = Number((body as { id?: unknown } | null)?.id);

    const deleteTourUseCase = new DeleteTourUseCase(auth.client);
    await deleteTourUseCase.execute(id);
    return jsonResponse({ ok: true });
  } catch (error) {
    const status = error instanceof ValidationError ? 400 : 500;
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : "Error interno del servidor" }, status);
  }
};
