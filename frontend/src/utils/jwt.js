// Helper to extract email from Google ID token (JWT)
export function extractEmailFromIdToken(idToken) {
  if (!idToken) return null;
  const parts = idToken.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.email || null;
  } catch (e) {
    return null;
  }
}
