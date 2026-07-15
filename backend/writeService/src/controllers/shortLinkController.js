export function createShortLinkController(service) {
  return async (request, response, next) => {
    try {
      const link = await service.create(request.body?.url, request.body?.customAlias);
      response
        .status(201)
        .json({
          code: link.code,
          shortUrl: `${request.protocol}://${request.get("host")}/${link.code}`,
          customAlias: Boolean(link.customAlias),
        });
    } catch (error) {
      next(error);
    }
  };
}
