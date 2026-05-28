import type { Handler } from "@netlify/functions";
import { isAuthenticated, json, requireAdmin } from "./_auth";
import { allMenuItems, connectMenuStore, isMenuInputError, publicMenuItems, saveMenuItems } from "./_menus";

export const handler: Handler = async (event) => {
  connectMenuStore(event);

  if (event.httpMethod === "GET") {
    try {
      const items = isAuthenticated(event) ? await allMenuItems() : await publicMenuItems();
      return json(200, { items });
    } catch (error) {
      console.error("Unable to load menu", error);
      return json(500, { error: "Unable to load menu content." });
    }
  }

  const unauthorized = requireAdmin(event);
  if (unauthorized) return unauthorized;

  if (event.httpMethod === "PUT") {
    try {
      const payload = JSON.parse(event.body || "{}") as { items?: unknown };
      const items = await saveMenuItems(payload.items);
      return json(200, { items });
    } catch (error) {
      if (error instanceof SyntaxError || isMenuInputError(error)) {
        return json(400, { error: error instanceof Error ? error.message : "Invalid menu." });
      }
      console.error("Unable to save menu", error);
      return json(500, { error: "Unable to save menu content." });
    }
  }

  return json(405, { error: "Method not allowed." });
};
