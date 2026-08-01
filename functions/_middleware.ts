import type { PageFunction } from "./_shared";

export const onRequest: PageFunction = async ({ request, next }) => {
  const url = new URL(request.url);
  if (url.hostname === "www.discomedia.co") {
    url.hostname = "discomedia.co";
    return Response.redirect(url, 301);
  }
  return next();
};
