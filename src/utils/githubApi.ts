import type { GitHubProfile, RateLimitInfo } from '../types';

const CACHE_KEY = 'gh_profiles_cache';
const TOKEN_KEY = 'gh_pat';

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setToken(token: string): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

function getCache(): Record<string, GitHubProfile> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') as Record<string, GitHubProfile>;
  } catch {
    return {};
  }
}

function setCache(cache: Record<string, GitHubProfile>): void {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

async function fetchProfile(username: string, token: string): Promise<GitHubProfile | null> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers });
    if (!res.ok) return null;
    const data = (await res.json()) as { name?: string; avatar_url?: string };
    return {
      name: data.name || null,
      avatarUrl: data.avatar_url || null,
    };
  } catch {
    return null;
  }
}

export async function resolveProfiles(
  usernames: string[],
  token: string,
  onProgress?: (completed: number, total: number) => void
): Promise<Record<string, GitHubProfile>> {
  const cache = getCache();
  const toFetch = usernames.filter((u) => !(u in cache));
  let completed = 0;

  const concurrency = 5;
  let index = 0;

  async function next(): Promise<void> {
    while (index < toFetch.length) {
      const username = toFetch[index++]!;
      const profile = await fetchProfile(username, token);
      cache[username] = profile ?? { name: null, avatarUrl: null };
      completed++;
      onProgress?.(completed, toFetch.length);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, toFetch.length) }, () => next());
  await Promise.all(workers);

  setCache(cache);
  return cache;
}

export function getCachedProfiles(): Record<string, GitHubProfile> {
  return getCache();
}

export function displayName(username: string, profiles?: Record<string, GitHubProfile>): string {
  const p = profiles?.[username];
  if (p?.name) return `${p.name} (${username})`;
  return username;
}

export async function checkRateLimit(token: string): Promise<RateLimitInfo | null> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  try {
    const res = await fetch('https://api.github.com/rate_limit', { headers });
    if (!res.ok) return null;
    const data = (await res.json()) as { rate: { limit: number; remaining: number; reset: number } };
    return {
      limit: data.rate.limit,
      remaining: data.rate.remaining,
      resetAt: new Date(data.rate.reset * 1000),
    };
  } catch {
    return null;
  }
}
