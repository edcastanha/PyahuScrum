# Data Model - GitHub OAuth Authentication with Login Home

## Entity: User

Represents an authenticated developer linked to a GitHub account.

### Fields
- id: string (Mongo ObjectId)
- githubId: string (unique, required)
- username: string (required)
- displayName: string (optional)
- email: string (optional)
- avatarUrl: string (optional)
- bio: string (optional)
- followers: number (default 0)
- publicRepos: number (default 0)
- accessTokenEncrypted: string (required)
- tokenExpiresAt: datetime (required)
- isActive: boolean (default true)
- lastLoginAt: datetime (required)
- createdAt: datetime (required)
- updatedAt: datetime (required)

### Validation Rules
- githubId must be unique and non-empty.
- username must be non-empty.
- tokenExpiresAt must be a valid future date at save time.
- followers and publicRepos must be >= 0.

### State Transitions
- New -> Active: first successful OAuth callback.
- Active -> Active: subsequent logins update profile/token timestamps.
- Active -> Inactive: optional administrative deactivation (out of current scope).

## Entity: Session

Represents a login session for a user.

### Fields
- id: string (Mongo ObjectId)
- userId: string (ref User.id, required)
- jwtId: string (unique, required)
- expiresAt: datetime (required)
- lastActivityAt: datetime (required)
- revokedAt: datetime (optional)
- createdAt: datetime (required)
- updatedAt: datetime (required)

### Validation Rules
- userId must reference an existing active User.
- expiresAt must be later than createdAt.
- revokedAt, when present, must be <= current time.

### State Transitions
- Created -> Active: session issued after login callback.
- Active -> Revoked: explicit logout.
- Active -> Expired: natural TTL expiration.

## Entity: OAuthAuditEvent

Tracks auth-relevant events for troubleshooting and security visibility.

### Fields
- id: string (Mongo ObjectId)
- userId: string (optional ref User.id)
- githubId: string (optional)
- eventType: enum (LOGIN_START, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, SESSION_EXPIRED)
- reason: string (optional)
- ip: string (optional)
- userAgent: string (optional)
- createdAt: datetime (required)

### Validation Rules
- eventType must be one of the enum values.
- reason required for LOGIN_FAILURE.

## Relationships
- User 1:N Session
- User 1:N OAuthAuditEvent

## Indexing Strategy
- User.githubId unique index.
- Session.userId + revokedAt composite index.
- Session.expiresAt TTL index for cleanup.
- OAuthAuditEvent.createdAt descending index for diagnostics.
