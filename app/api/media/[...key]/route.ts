import { getCtx } from "@/lib/server/context";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ key: string[] }> };

const CACHE_CONTROL = "public, max-age=31536000, immutable";

export async function GET(request: Request, { params }: Params) {
  const { env } = await getCtx();
  const { key: segments } = await params;
  const key = (segments ?? []).map(decodeURIComponent).join("/");

  // Only serve media namespaces. Reject traversal / other prefixes.
  if (
    key.includes("..") ||
    !(key.startsWith("videos/") || key.startsWith("thumbs/"))
  ) {
    return new Response("Forbidden", { status: 403 });
  }

  const rangeHeader = request.headers.get("range");

  // No Range: full object.
  if (!rangeHeader) {
    const object = await env.MEDIA.get(key);
    if (!object) return new Response("Not found", { status: 404 });
    const headers = baseHeaders(object, key);
    headers.set("Content-Length", String(object.size));
    return new Response(object.body, { status: 200, headers });
  }

  // Parse "bytes=start-end" (single range only).
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
  if (!match) {
    // Unparseable range -> serve full body.
    const object = await env.MEDIA.get(key);
    if (!object) return new Response("Not found", { status: 404 });
    const headers = baseHeaders(object, key);
    headers.set("Content-Length", String(object.size));
    return new Response(object.body, { status: 200, headers });
  }

  const startStr = match[1];
  const endStr = match[2];

  let r2Range: R2Range;
  if (startStr === "" && endStr !== "") {
    // Suffix range: last N bytes.
    r2Range = { suffix: Number(endStr) };
  } else if (startStr !== "" && endStr === "") {
    r2Range = { offset: Number(startStr) };
  } else if (startStr !== "" && endStr !== "") {
    const offset = Number(startStr);
    r2Range = { offset, length: Number(endStr) - offset + 1 };
  } else {
    return new Response("Invalid range", { status: 416 });
  }

  const object = await env.MEDIA.get(key, { range: r2Range });
  if (!object) return new Response("Not found", { status: 404 });

  const total = object.size; // total object size
  // object.range describes the served slice.
  const served = object.range as
    | { offset?: number; length?: number; suffix?: number }
    | undefined;

  let start: number;
  let length: number;
  if (served && "suffix" in served && served.suffix != null) {
    start = total - served.suffix;
    length = served.suffix;
  } else {
    start = served?.offset ?? 0;
    length = served?.length ?? total - start;
  }
  const end = start + length - 1;

  if (start >= total || start < 0) {
    return new Response("Range not satisfiable", {
      status: 416,
      headers: { "Content-Range": `bytes */${total}` },
    });
  }

  const headers = baseHeaders(object, key);
  headers.set("Content-Range", `bytes ${start}-${end}/${total}`);
  headers.set("Content-Length", String(length));
  return new Response(object.body, { status: 206, headers });
}

function baseHeaders(object: R2Object, key: string): Headers {
  const headers = new Headers();
  const contentType =
    object.httpMetadata?.contentType ?? guessContentType(key);
  headers.set("Content-Type", contentType);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", CACHE_CONTROL);
  if (object.httpEtag) headers.set("ETag", object.httpEtag);
  return headers;
}

function guessContentType(key: string): string {
  if (key.endsWith(".mp4")) return "video/mp4";
  if (key.endsWith(".webm")) return "video/webm";
  if (key.endsWith(".jpg") || key.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}
