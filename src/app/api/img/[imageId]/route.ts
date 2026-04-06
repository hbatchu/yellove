export const dynamic = "force-dynamic";

// Proxy Cricbuzz team/player images through our server so the RapidAPI key
// stays server-side and browsers never hit cricbuzz-cricket.p.rapidapi.com directly.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ imageId: string }> },
) {
  const { imageId } = await params;
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    return new Response("RAPIDAPI_KEY not set", { status: 500 });
  }

  const upstream = await fetch(
    `https://cricbuzz-cricket.p.rapidapi.com/img/v1/i1/c${imageId}/i.jpg`,
    {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "cricbuzz-cricket.p.rapidapi.com",
      },
    },
  );

  if (!upstream.ok) {
    // Return a transparent 1x1 PNG so broken images don't break layouts
    const transparent1x1 =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
    return new Response(Buffer.from(transparent1x1, "base64"), {
      headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=60" },
    });
  }

  const blob = await upstream.arrayBuffer();
  const contentType = upstream.headers.get("content-type") ?? "image/jpeg";

  return new Response(blob, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400", // cache 24h
    },
  });
}
