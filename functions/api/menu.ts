import { isAuthenticated, requireAdmin } from "../_auth";
import { allMenuItems, CmsInputError, publicMenuItems, saveMenuItems } from "../_cms";
import { json, methodNotAllowed, readJson, type Env, type PageFunction } from "../_shared";

export const onRequest: PageFunction = async ({ request, env }) => {
  if (request.method === "GET") {
    try {
      return json({ items: (await isAuthenticated(request, env)) ? await allMenuItems(env) : await publicMenuItems(env) });
    } catch (error) {
      console.error("Unable to load menu", error);
      return json({ error: "Unable to load menu content." }, 500);
    }
  }

  const unauthorized = await requireAdmin(request, env);
  if (unauthorized) return unauthorized;
  if (request.method !== "PUT") return methodNotAllowed();
  const body = await readJson(request);
  try {
    return json({ items: await saveMenuItems(env, body?.items) });
  } catch (error) {
    if (error instanceof CmsInputError) return json({ error: error.message }, 400);
    console.error("Unable to save menu", error);
    return json({ error: "Unable to save menu content." }, 500);
  }
};
