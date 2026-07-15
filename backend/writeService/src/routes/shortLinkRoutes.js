import { Router } from 'express';
import { createShortLinkController } from '../controllers/shortLinkController.js';

export function createShortLinkRouter(service) {
  const router = Router();
  router.post('/shorten', createShortLinkController(service));
  return router;
}
