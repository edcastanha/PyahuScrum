import { GitHubProfile } from './authStorage';
import { SidebarProfileSummary } from './profileSummary.types';

const DEFAULT_NAME = 'Usuário';
const DEFAULT_LOCATION = 'Localização não informada';

function normalizeName(name: string | null | undefined): string | null {
  const trimmed = name?.trim();
  return trimmed ? trimmed : null;
}

function getFirstName(name: string | null | undefined): string | null {
  const normalized = normalizeName(name);

  if (!normalized) {
    return null;
  }

  const parts = normalized.split(/\s+/);
  return parts[0] || null;
}

function deriveInitials(displayName: string): string {
  const trimmed = displayName.trim();

  if (!trimmed) {
    return 'U';
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }

  return trimmed.slice(0, 2).toUpperCase();
}

export function buildSidebarProfileSummary(
  profile: GitHubProfile | null,
  githubLogin: string | null
): SidebarProfileSummary {
  const firstName = getFirstName(profile?.name);
  const fallbackLogin = normalizeName(githubLogin);
  const displayName = firstName || fallbackLogin || DEFAULT_NAME;

  const location = normalizeName(profile?.location);
  const displayLocation = location || DEFAULT_LOCATION;

  const avatarSource = normalizeName(profile?.avatar_url);
  const avatarFallback = deriveInitials(displayName);

  return {
    displayName,
    displayLocation,
    avatarSource,
    avatarFallback
  };
}
