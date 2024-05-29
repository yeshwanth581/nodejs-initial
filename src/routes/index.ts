import { Router } from 'express';
import { getRepositories, createSample } from '../controllers/repositories';

const router = Router();

router.get('/', getRepositories);
router.post('/', createSample);

export default router;
