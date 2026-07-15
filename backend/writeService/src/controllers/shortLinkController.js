export function createShortLinkController(service) {
  return async (request, response, next) => {
    try {
      const link = await service.create(request.body?.url);
      response
        .status(201)
        .json({
          code: link.code,
          shortUrl: `${request.protocol}://${request.get("host")}/${link.code}`,
        });
    } catch (error) {
      next(error);
    }
  };
}
