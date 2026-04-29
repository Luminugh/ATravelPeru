import type { CatalogItem } from "./catalog";

const CACHE_FILE = "./src/data/tours-cache.json";

export async function loadCachedTours(): Promise<CatalogItem[]> {
  try {
    const response = await fetch("file://" + process.cwd() + "/" + CACHE_FILE);
    if (response.ok) {
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
  } catch (error) {
    console.log("Cache file not found or not readable, will generate on first build");
  }
  return [];
}

export async function saveCachedTours(items: CatalogItem[]): Promise<void> {
  try {
    const fs = await import("fs/promises");
    const dir = "./src/data";
    
    // Create directory if it doesn't exist
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (e) {
      // Directory might already exist
    }
    
    await fs.writeFile(CACHE_FILE, JSON.stringify(items, null, 2));
    console.log(`Cached ${items.length} tours to ${CACHE_FILE}`);
  } catch (error) {
    console.log("Could not save tour cache, continuing without it");
  }
}
