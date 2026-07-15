import { resolveCode } from "../services/shortLinkService.js";
export async function redirectToDestination(request, response, next) {
  try {
    const url = await resolveCode(request.params.code);
    if (!url) return response.sendStatus(404);
    return response.redirect(301, url);
  } catch (error) {
    next(error);
  }
}
