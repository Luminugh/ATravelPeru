import type { APIRoute } from "astro";
import { tourUseCases } from "../../infrastructure/composition";

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const items = await tourUseCases.getCatalog.execute();

    return new Response(JSON.stringify({ ok: true, items }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : "Internal server error",
        items: [],
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
