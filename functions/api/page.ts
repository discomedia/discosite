import { isAuthenticated, requireAdmin } from "../_auth";
import { CmsInputError, deletePage, findPage, savePage } from "../_cms";
import { json, methodNotAllowed, readJson, type Env, type PageFunction } from "../_shared";

export const onRequest: PageFunction = async ({ request, env }) => {
  const url = new URL(request.url);
  if (request.method === "GET") {
    try {
      const page = await findPage(env, url.searchParams.get("slug") ?? "/");
      if (!page || (!page.published && !(await isAuthenticated(request, env)))) return json({ error: "Page not found." }, 404);
      return json({ page });
    } catch (error) {
      console.error("Unable to load page", error);
      return json({ error: "Unable to load page content." }, 500);
    }
  }

  const unauthorized = await requireAdmin(request, env);
  if (unauthorized) return unauthorized;
  try {
    if (request.method === "PUT") {
      const input = await readJson(request);
      if (!input) return json({ error: "Invalid page." }, 400);
      return json({ page: await savePage(env, input) });
    }
    if (request.method === "DELETE") {
      await deletePage(env, url.searchParams.get("slug") ?? "");
      return json({ ok: true });
    }
    return methodNotAllowed();
  } catch (error) {
    if (error instanceof CmsInputError) return json({ error: error.message }, 400);
    console.error("Unable to save page", error);
    return json({ error: "Unable to save page content." }, 500);
  }
};
