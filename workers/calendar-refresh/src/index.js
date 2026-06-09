export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(triggerPagesDeploy(env));
  },

  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET") {
      return new Response("sssoftware calendar refresh worker is running.", {
        headers: { "content-type": "text/plain; charset=utf-8" }
      });
    }

    if (request.method === "POST" && (url.pathname === "/" || url.pathname === "/refresh")) {
      const authError = validateManualRefresh(request, env);
      if (authError) return authError;

      const result = await triggerPagesDeploy(env);
      return Response.json(result);
    }

    return new Response("Not found", { status: 404 });
  }
};

function validateManualRefresh(request, env) {
  if (!env.MANUAL_REFRESH_TOKEN) return null;

  const expected = `Bearer ${env.MANUAL_REFRESH_TOKEN}`;
  if (request.headers.get("authorization") === expected) return null;

  return new Response("Unauthorized", { status: 401 });
}

async function triggerPagesDeploy(env) {
  if (!env.PAGES_DEPLOY_HOOK_URL) {
    throw new Error("Missing PAGES_DEPLOY_HOOK_URL secret.");
  }

  const response = await fetch(env.PAGES_DEPLOY_HOOK_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      source: "sssoftware-calendar-refresh"
    })
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Cloudflare Pages deploy hook failed: ${response.status} ${body}`);
  }

  return {
    ok: true,
    status: response.status,
    body
  };
}
