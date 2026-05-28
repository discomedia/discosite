import type { Handler } from "@netlify/functions";
import { json, requireAdmin } from "./_auth";
import { allPages } from "./_pages";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") return json(405, { error: "Method not allowed." });
  const unauthorized = requireAdmin(event);
  if (unauthorized) return unauthorized;

  const pages = await allPages();
  return json(200, { pages });
};
