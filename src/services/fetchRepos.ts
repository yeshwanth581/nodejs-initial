import axios from 'axios';

const GITHUB_API_URL = 'https://api.github.com/search/repositories';

export const fetchRepositories = async (query: string) => {
  const response = await axios.get(`${GITHUB_API_URL}?q=${query}`);
  return response.data.items;
};

export const calculateScore = (stars: number, forks: number, lastUpdated: string): number => {
  const lastUpdate = new Date(lastUpdated);
  const now = new Date();
  const recencyScore = 1 / ((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
  return stars * 0.5 + forks * 0.3 + recencyScore * 0.2;
};
