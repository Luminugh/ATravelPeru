import type { APIRoute } from "astro";
import { LogoutUseCase } from "../../../../application/use-cases/LogoutUseCase";
import { ADMIN_ACCESS_COOKIE, ADMIN_ACTIVITY_COOKIE } from "../../../../domain/services/SessionService";

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
  const logoutUseCase = new LogoutUseCase();
  logoutUseCase.execute();

  cookies.delete(ADMIN_ACCESS_COOKIE, { path: "/" });
  cookies.delete(ADMIN_ACTIVITY_COOKIE, { path: "/" });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
