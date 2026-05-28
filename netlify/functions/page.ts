import type { Handler } from "@netlify/functions";
import { isAuthenticated, json, requireAdmin } from "./_auth";
import { connectPageStore, deletePage, findPage, isPageInputError, savePage } from "./_pages";

export const handler: Handler = async (event) => {
  connectPageStore(event);

  if (event.httpMethod === "GET") {
    try {
      const slug = event.queryStringParameters?.slug || "/";
      const page = await findPage(slug);
      if (!page || (!page.published && !isAuthenticated(event))) {
        return json(404, { error: "Page not found." });
      }
      return json(200, { page });
    } catch (error) {
      console.error("Unable to load page", error);
      return json(500, { error: "Unable to load page content." });
    }
  }

  const unauthorized = requireAdmin(event);
  if (unauthorized) return unauthorized;

  if (event.httpMethod === "PUT") {
    try {
      const page = await savePage(JSON.parse(event.body || "{}"));
      return json(200, { page });
    } catch (error) {
      if (error instanceof SyntaxError || isPageInputError(error)) {
        return json(400, { error: error instanceof Error ? error.message : "Invalid page." });
      }
      console.error("Unable to save page", error);
      return json(500, { error: "Unable to save page content." });
    }
  }

  if (event.httpMethod === "DELETE") {
    try {
      const slug = event.queryStringParameters?.slug || "";
      await deletePage(slug);
      return json(200, { ok: true });
    } catch (error) {
      if (isPageInputError(error)) {
        return json(400, { error: error.message });
      }
      console.error("Unable to delete page", error);
      return json(500, { error: "Unable to delete page content." });
    }
  }

  return json(405, { error: "Method not allowed." });
};
