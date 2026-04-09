import { fetchGithubUserProfile } from './githubAuthService';

describe('fetchGithubUserProfile', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches a github profile', async () => {
    const fetchMock = jest.spyOn(global, 'fetch' as never).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        login: 'edson',
        id: 123,
        avatar_url: 'https://avatar.test',
        name: 'Edson',
        location: 'Recife',
        bio: 'Developer',
        public_repos: 10,
        followers: 5
      })
    } as Response);

    const profile = await fetchGithubUserProfile('edson');

    expect(fetchMock).toHaveBeenCalledWith('https://api.github.com/users/edson');
    expect(profile.login).toBe('edson');
    expect(profile.public_repos).toBe(10);
  });

  it('throws a 404 error for unknown user', async () => {
    jest.spyOn(global, 'fetch' as never).mockResolvedValue({
      ok: false,
      status: 404
    } as Response);

    await expect(fetchGithubUserProfile('missing')).rejects.toThrow('404');
  });
});
