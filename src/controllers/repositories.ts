import { Request, Response } from 'express';
import { calculateScore, fetchRepositories } from '../services/fetchRepos';

export const getRepositories = async (req: Request, res: Response) => {
  const { query, createdAfter } = req.query;
  // try {
  //   const repositories = await fetchRepositories(query as string);
  //   const scoredRepositories = repositories
  //     .filter(repo => new Date(repo.created_at) >= new Date(createdAfter as string))
  //     .map(repo => ({
  //       name: repo.name,
  //       score: calculateScore(repo.stargazers_count, repo.forks_count, repo.updated_at)
  //     }));

  //   res.json(scoredRepositories);
  // } catch (error) {
  //   res.status(500).send('Error fetching repositories');
  // }
  res.status(200).json({success: 'success'})
};

export const createSample = (req: Request, res: Response) => {
  const data = req.body;
  res.status(201).json({ message: 'POST request to the sample endpoint', data });
};
