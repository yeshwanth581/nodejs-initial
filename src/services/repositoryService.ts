import axios from 'axios';
import logger from '../utils/logger';
import { API_BASE_URL, FETCH_ALL_REPOS_LIST_ENDPOINT, FETCH_REPO_INFO } from '../constants/contants';
import { RepositoryItem, ScoringMetrics } from '../types/repository';
import { getIndividualScore } from '../utils/scoringEngine';
import { getAndClearCache, setCache, setCacheForMultipleItems } from '../providers';

type DisplayParams = {
  page: number;
  per_page: number;
  sort: string;
  order: 'asc' | 'desc';
};

export const fetchAllRepositories = async (language: string, created: string, displayParams: DisplayParams, excludedMetrics: ScoringMetrics[]) => {
  try {
    const queryParams: Record<string, any> = {
      q: `language:${language || ''}${created ? `+created:>=${created}` : ''}`,
      ...displayParams
    };

    const requestUrl = new URL(`${API_BASE_URL}/${FETCH_ALL_REPOS_LIST_ENDPOINT}?`);
    Object.keys(queryParams).forEach(param => {
      const value = queryParams[param];
      if (value) requestUrl.searchParams.append(param, value);
    });

    const response = await axios.get(decodeURIComponent(requestUrl.toString()));
    const transformedResponse = transformRepositoriesWithScores(response.data, excludedMetrics);
    await cacheRepositories(transformedResponse);

    return transformedResponse;
  } catch (error) {
    logger.error('An error occurred while fetching data from GitHub:', error);
    throw error;
  }
};

export const fetchRepositoryInfo = async (owner: string, repo: string, excludedMetrics: ScoringMetrics[]) => {
  try {
    const requestUrl = `${API_BASE_URL}/${FETCH_REPO_INFO}/${owner}/${repo}`;
    const response = await axios.get(requestUrl);

    const transformedResponse = calculateRepositoryScore(response.data, excludedMetrics);
    // fetch cached info of repo if available and upsert with new info
    const cachedRepository = await getAndClearCache(transformedResponse.git_url);
    await setCache(transformedResponse.git_url, transformedResponse);

    if (cachedRepository) {
      const scoreOfCachedRepo = calculateRepositoryScore(cachedRepository, excludedMetrics)?.score
      return {
        ...transformedResponse,
        oldScore: scoreOfCachedRepo,
        diffPercentage: calculatePercentageDifference(transformedResponse.score, scoreOfCachedRepo)
      };
    }

    return { ...transformedResponse, oldScore: null, diffPercentage: null };
  } catch (error) {
    logger.error(`An error occurred while fetching ${owner}/${repo} repository data from GitHub:`, error);
    throw error;
  }
};

const transformRepositoriesWithScores = (response: any, excludedMetrics: ScoringMetrics[]): RepositoryItem[] => {
  return response.items.map((item: RepositoryItem) => calculateRepositoryScore(item, excludedMetrics));
};

const calculateRepositoryScore = (item: RepositoryItem, excludedMetrics: ScoringMetrics[]) => {
  const { id, git_url, full_name, description, created_at, language, stargazers_count, forks_count, updated_at } = item;
  const { stars, forks, recency } = getIndividualScore({ stars: stargazers_count, forks: forks_count, lastUpdated: new Date(updated_at) }, excludedMetrics);
  const totalScore = Number((stars.value + forks.value + recency.value).toFixed(2));

  const score = Math.min(100, totalScore);
  return {
    id,
    git_url,
    full_name,
    description,
    created_at,
    language,
    stargazers_count,
    forks_count,
    updated_at,
    score,
    breakdown: {
      recency,
      forks,
      stars
    }
  };
};

const cacheRepositories = async (data: RepositoryItem[]) => {
  const cacheEntries = data.map(item => ({
    key: item.git_url,
    val: item
  }));

  await setCacheForMultipleItems(cacheEntries);
};

const calculatePercentageDifference = (currentScore: number, previousScore: number) => {
  const difference = currentScore - previousScore;
  return Math.round((difference / previousScore) * 100);
};
