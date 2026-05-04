import type { APIRoute } from "astro";
import { GetToursCatalogUseCase } from "../../application/use-cases/GetToursCatalogUseCase";
import { SupabaseTourRepository } from "../../infrastructure/repositories/SupabaseTourRepository";

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    // Instantiate dependencies
    const tourRepository = new SupabaseTourRepository();
    const getToursCatalogUseCase = new GetToursCatalogUseCase(tourRepository);

    // Execute use case
    const items = await getToursCatalogUseCase.execute();

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
