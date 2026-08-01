import { requireAdmin } from "../_auth";
import { allPages } from "../_cms";
import { json, type Env, type PageFunction } from "../_shared";

export const onRequestGet: PageFunction = async ({ request, env }) => {
  const unauthorized = await requireAdmin(request, env);
  if (unauthorized) return unauthorized;
  try {
    return json({ pages: await allPages(env) });
  } catch (error) {
    console.error("Unable to load page content", error);
    return json({ error: "Unable to load page content." }, 500);
  }
};
