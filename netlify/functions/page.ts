import type { Handler } from "@netlify/functions";
import { isAuthenticated, json, requireAdmin } from "./_auth";
import { connectPageStore, deletePage, findPage, savePage } from "./_pages";

export const handler: Handler = async (event) => {
  connectPageStore(event);

  if (event.httpMethod === "GET") {
    const slug = event.queryStringParameters?.slug || "/";
    const page = await findPage(slug);
    if (!page || (!page.published && !isAuthenticated(event))) {
      return json(404, { error: "Page not found." });
    }
    return json(200, { page });
  }

  const unauthorized = requireAdmin(event);
  if (unauthorized) return unauthorized;

  if (event.httpMethod === "PUT") {
    try {
      const page = await savePage(JSON.parse(event.body || "{}"));
      return json(200, { page });
    } catch (error) {
      return json(400, { error: error instanceof Error ? error.message : "Invalid page." });
    }
  }

  if (event.httpMethod === "DELETE") {
    try {
      const slug = event.queryStringParameters?.slug || "";
      await deletePage(slug);
      return json(200, { ok: true });
    } catch (error) {
      return json(400, { error: error instanceof Error ? error.message : "Unable to delete page." });
    }
  }

  return json(405, { error: "Method not allowed." });
};
