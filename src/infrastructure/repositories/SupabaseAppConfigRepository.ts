// Infrastructure Repository - AppConfig
// Implements IAppConfigRepository from domain

import type { AppConfig, IAppConfigRepository } from "../../domain/models/repositories";
import { getSupabaseServerClient } from "../supabase/SupabaseClientFactory";

export class SupabaseAppConfigRepository implements IAppConfigRepository {
  async getByKey(key: string): Promise<AppConfig | null> {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      throw new Error("Supabase client not available");
    }

    try {
      const { data, error } = await supabase
        .from("app_config")
        .select("*")
        .eq("config_key", key)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return data ?? null;
    } catch (error) {
      console.error(`[AppConfigRepository] Error fetching ${key}:`, error);
      throw error;
    }
  }

  async upsert(key: string, value: string): Promise<AppConfig> {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      throw new Error("Supabase client not available");
    }

    try {
      const { data, error } = await supabase
        .from("app_config")
        .upsert([{ config_key: key, config_value: value }], {
          onConflict: "config_key",
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`[AppConfigRepository] Error upserting ${key}:`, error);
      throw error;
    }
  }
}
