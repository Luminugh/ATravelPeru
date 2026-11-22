export interface ResponsiveImageOptions {
  quality?: number;
  fit?: "cover" | "contain";
}

const IMAGE_WIDTHS = [480, 800, 1200] as const;
const DEFAULT_QUALITY = 68;

export function optimizedImageUrl(source: string, width = 800, options: ResponsiveImageOptions = {}): string {
  if (!source) return "";
  try {
    const url = new URL(source);
    const quality = Math.min(85, Math.max(40, Math.round(options.quality ?? DEFAULT_QUALITY)));
    const requestedWidth = Math.min(1800, Math.max(160, Math.round(width)));

    if (url.hostname === "images.unsplash.com") {
      url.searchParams.set("auto", "format");
      url.searchParams.set("fit", options.fit === "contain" ? "max" : "crop");
      url.searchParams.set("w", String(requestedWidth));
      url.searchParams.set("q", String(quality));
    } else if (url.hostname.endsWith(".supabase.co") && url.pathname.includes("/storage/v1/object/public/")) {
      url.pathname = url.pathname.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
      url.searchParams.set("width", String(requestedWidth));
      url.searchParams.set("quality", String(quality));
      url.searchParams.set("resize", options.fit === "contain" ? "contain" : "cover");
      url.searchParams.set("format", "webp");
    }

    return url.toString();
  } catch {
    return source;
  }
}

export function responsiveImageSrcSet(source: string, options: ResponsiveImageOptions = {}): string {
  return IMAGE_WIDTHS.map((width) => `${optimizedImageUrl(source, width, options)} ${width}w`).join(", ");
}
