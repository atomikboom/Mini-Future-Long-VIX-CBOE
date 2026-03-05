interface Env {
  ALLOW_ORIGIN?: string;
}

type PagesFunction<E = unknown> = (ctx: { request: Request; env: E }) => Promise<Response>;

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const reqUrl = new URL(request.url);
  const target = reqUrl.searchParams.get("url");

  if (!target) {
    return new Response(JSON.stringify({ error: "Missing url query param" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const response = await fetch(target, {
    headers: { Accept: "application/json" },
  });

  const body = await response.text();
  return new Response(body, {
    status: response.status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=60",
      "access-control-allow-origin": env.ALLOW_ORIGIN || "*",
    },
  });
};
