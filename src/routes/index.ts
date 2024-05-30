import { Router } from 'express';
import { getAllRepos, getRepoInfo } from '../controllers';
import { validateQueryParams } from '../validators';

const router = Router();

router.get('/getAllRepos', validateQueryParams, getAllRepos);
router.get('/:username/:repositoryName/getRepoInfo', getRepoInfo)

export default router;
