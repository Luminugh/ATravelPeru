import type { APIRoute } from "astro";
import { GetAccountUseCase } from "../../../application/use-cases/GetAccountUseCase";
import { UpdateAccountUseCase } from "../../../application/use-cases/UpdateAccountUseCase";
import { createSupabaseAuthedClient } from "../../../infrastructure/supabase/AdminAuthClientFactory";
import { ADMIN_ACCESS_COOKIE, ADMIN_ACTIVITY_COOKIE } from "../../../domain/services/SessionService";
import { UnauthorizedError, ValidationError } from "../../../domain/errors/DomainError";

export const prerender = false;

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const accessToken = cookies.get(ADMIN_ACCESS_COOKIE)?.value;
    const lastActivity = cookies.get(ADMIN_ACTIVITY_COOKIE)?.value;

    const client = createSupabaseAuthedClient(accessToken || "");
    const getAccountUseCase = new GetAccountUseCase(client);
    const data = await getAccountUseCase.execute(accessToken, lastActivity);

    return json({
      ok: true,
      data,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      cookies.delete(ADMIN_ACCESS_COOKIE, { path: "/" });
      cookies.delete(ADMIN_ACTIVITY_COOKIE, { path: "/" });
      return json({ ok: false, error: error.message }, 401);
    }
    return json({ ok: false, error: error instanceof Error ? error.message : "Error interno del servidor" }, 500);
  }
};

export const PUT: APIRoute = async ({ cookies, request }) => {
  try {
    const accessToken = cookies.get(ADMIN_ACCESS_COOKIE)?.value;
    const lastActivity = cookies.get(ADMIN_ACTIVITY_COOKIE)?.value;

    if (!accessToken) {
      return json({ ok: false, error: "No autenticado" }, 401);
    }

    const client = createSupabaseAuthedClient(accessToken);
    const { data: userData, error: userError } = await client.auth.getUser(accessToken);
    if (userError || !userData?.user) {
      return json({ ok: false, error: "Sesion invalida" }, 401);
    }

    const body = await request.json().catch(() => null);
    const { nombre, telefono } = body || {};

    const updateAccountUseCase = new UpdateAccountUseCase(client);
    const result = await updateAccountUseCase.execute(userData.user.id, nombre, telefono);

    return json({
      ok: true,
      data: result,
    });
  } catch (error) {
    const status = 
      error instanceof ValidationError ? 400 :
      error instanceof UnauthorizedError ? 401 :
      500;
    return json({ ok: false, error: error instanceof Error ? error.message : "Error interno del servidor" }, status);
  }
};
