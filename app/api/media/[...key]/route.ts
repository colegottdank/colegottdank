import { getCtx } from "@/lib/server/context";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ key: string[] }> };

const CACHE_CONTROL = "public, max-age=31536000, immutable";

// Only keys this app writes: videos/<userId>/<name>.(mp4|webm), thumbs/<userId>/<name>.jpg
// (<name> is a uuid for uploads; seeded videos use slugs like candy-making).
const KEY_RE = /^(videos\/\d+\/[A-Za-z0-9_-][A-Za-z0-9._-]{0,99}\.(mp4|webm)|thumbs\/\d+\/[A-Za-z0-9_-][A-Za-z0-9._-]{0,99}\.jpg)$/;

export async function GET(request: Request, { params }: Params) {
  const { env } = await getCtx();
  const { key: segments } = await params;
  let key: string;
  try {
    key = (segments ?? []).map(decodeURIComponent).join("/");
  } catch {
    return new Response("Forbidden", { status: 403 });
  }

  if (!KEY_RE.test(key) || key.includes("..")) {
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
    const length = Number(endStr) - offset + 1;
    if (length <= 0) return new Response("Invalid range", { status: 416 });
    r2Range = { offset, length };
  } else {
    return new Response("Invalid range", { status: 416 });
  }

  let object: R2ObjectBody | null;
  try {
    object = await env.MEDIA.get(key, { range: r2Range });
  } catch {
    return new Response("Range not satisfiable", { status: 416 });
  }
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
  // Trust the extension we validated in KEY_RE over whatever metadata says.
  headers.set("Content-Type", guessContentType(key));
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", CACHE_CONTROL);
  // User-uploaded bytes: never let the browser sniff or script them.
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Content-Security-Policy", "default-src 'none'; sandbox");
  headers.set("Content-Disposition", "inline");
  if (object.httpEtag) headers.set("ETag", object.httpEtag);
  return headers;
}

function guessContentType(key: string): string {
  if (key.endsWith(".mp4")) return "video/mp4";
  if (key.endsWith(".webm")) return "video/webm";
  if (key.endsWith(".jpg") || key.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}
