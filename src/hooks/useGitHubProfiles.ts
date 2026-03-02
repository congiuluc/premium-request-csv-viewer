import { useState, useEffect, useCallback } from 'react';
import type { GitHubProfile } from '../types';
import { getToken, resolveProfiles, getCachedProfiles } from '../utils/githubApi';

export function useGitHubProfiles(usernames: string[]) {
  const [profiles, setProfiles] = useState<Record<string, GitHubProfile>>(() => getCachedProfiles());
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });

  const resolve = useCallback(async () => {
    if (!usernames || usernames.length === 0) return;
    const token = getToken();
    setLoading(true);
    setProgress({ completed: 0, total: usernames.length });
    try {
      const result = await resolveProfiles(usernames, token, (completed, total) => {
        setProgress({ completed, total });
      });
      setProfiles({ ...result });
    } finally {
      setLoading(false);
    }
  }, [usernames]);

  useEffect(() => {
    if (usernames && usernames.length > 0) {
      const cached = getCachedProfiles();
      const uncached = usernames.filter((u) => !(u in cached));
      if (uncached.length > 0) {
        resolve();
      }
    }
  }, [usernames, resolve]);

  return { profiles, loading, progress, resolve };
}
