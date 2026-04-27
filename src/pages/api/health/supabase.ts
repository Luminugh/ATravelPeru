import type { APIRoute } from "astro";
import { getSupabaseServerClient } from "../../../lib/supabase";

export const GET: APIRoute = async () => {
  try {
    const supabase = getSupabaseServerClient();

    const [viewResult, catalogViewResult, toursCountResult, activeToursCountResult, sampleResult] = await Promise.all([
      supabase
        .from("v_tours_catalogo")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("v_catalogo_servicios")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("tours")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("tours")
        .select("id", { count: "exact", head: true })
        .eq("estado", "activo"),
      supabase
        .from("tours")
        .select("id,titulo,estado,precio")
        .order("id", { ascending: true })
        .limit(3),
    ]);

    const payload = {
      connected: !viewResult.error || !toursCountResult.error,
      env: {
        hasProjectId: Boolean(process.env.SUPABASE_PROJECT_ID),
        hasPublicUrl: Boolean(process.env.PUBLIC_SUPABASE_URL),
        hasPublishableKey: Boolean(
          process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY
        ),
      },
      view: {
        ok: !viewResult.error,
        count: viewResult.count ?? 0,
        error: viewResult.error?.message ?? null,
      },
      catalogView: {
        ok: !catalogViewResult.error,
        count: catalogViewResult.count ?? 0,
        error: catalogViewResult.error?.message ?? null,
      },
      toursTable: {
        ok: !toursCountResult.error,
        count: toursCountResult.count ?? 0,
        error: toursCountResult.error?.message ?? null,
      },
      activeTours: {
        ok: !activeToursCountResult.error,
        count: activeToursCountResult.count ?? 0,
        error: activeToursCountResult.error?.message ?? null,
      },
      sampleRows: sampleResult.data ?? [],
      sampleError: sampleResult.error?.message ?? null,
    };

    return new Response(JSON.stringify(payload, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify(
        {
          connected: false,
          error: error instanceof Error ? error.message : "Unexpected error",
        },
        null,
        2
      ),
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        status: 500,
      }
    );
  }
};
