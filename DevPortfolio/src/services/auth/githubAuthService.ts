export interface GitHubUserProfile {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
}

const GITHUB_USERS_BASE_URL = 'https://api.github.com/users';

export async function fetchGithubUserProfile(username: string): Promise<GitHubUserProfile> {
  const normalizedUsername = username.trim();

  if (!normalizedUsername) {
    throw new Error('Username inválido');
  }

  const response = await fetch(`${GITHUB_USERS_BASE_URL}/${encodeURIComponent(normalizedUsername)}`);

  if (response.status === 404) {
    throw new Error('404');
  }

  if (response.status === 403) {
    throw new Error('403');
  }

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return (await response.json()) as GitHubUserProfile;
}
