import { Router } from 'express';
import { redirectToDestination } from '../controllers/shortLinkController.js';
const router = Router();
router.get('/:code', redirectToDestination);
export default router;
