import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createSignedAdminToken, verifySignedAdminToken } from './auth-utils';

/**
 * Récupère le mot de passe admin depuis les variables d'environnement.
 * En production, ADMIN_PASSWORD DOIT être défini et avoir au moins 8 caractères.
 */
function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    if (process.env.NODE_ENV === 'production') {
      console.error(
        '🔴 CRITICAL: ADMIN_PASSWORD environment variable is not set. Admin panel is DISABLED in production.'
      );
      // Retourner une valeur impossible à deviner pour bloquer toute connexion
      return crypto.randomUUID() + crypto.randomUUID();
    }
    // En développement uniquement, utiliser un mot de passe par défaut avec avertissement
    console.warn(
      '⚠️  ADMIN_PASSWORD is not set. Using default dev password. DO NOT use in production!'
    );
    return 'dev-admin-password-change-me';
  }

  if (password.length < 8) {
    console.warn(
      '⚠️  ADMIN_PASSWORD is too short (< 8 chars). Please use a stronger password.'
    );
  }

  return password;
}

/**
 * Vérifie si l'utilisateur est authentifié en tant qu'admin.
 * Le cookie contient un token HMAC signé (pas le mot de passe en clair).
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_token');
    if (!adminToken?.value) return false;

    // Vérifier la signature HMAC du token
    return verifySignedAdminToken(adminToken.value);
  } catch {
    return false;
  }
}

/**
 * Authentifie l'admin avec un mot de passe.
 * Si le mot de passe est correct, un token HMAC signé est créé et stocké dans un cookie httpOnly.
 */
export async function authenticateAdmin(password: string): Promise<boolean> {
  const adminPassword = getAdminPassword();

  if (password === adminPassword) {
    // Créer un token signé HMAC-SHA256 (le mot de passe N'EST PAS dans le cookie)
    const signedToken = createSignedAdminToken();

    const cookieStore = await cookies();
    const isProduction = Boolean(process.env.VERCEL) || process.env.NODE_ENV === 'production';

    cookieStore.set('admin_token', signedToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/',
    });
    return true;
  }
  return false;
}

/**
 * Déconnecte l'admin
 */
export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');
}

/**
 * Middleware pour protéger les routes admin (throw)
 */
export async function requireAdmin() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    throw new Error('Unauthorized');
  }
}

/**
 * Guard pour les API routes admin.
 * Retourne une réponse 401 si non authentifié, ou `null` si OK.
 *
 * Usage dans un route handler :
 * ```ts
 * const denied = await adminGuard();
 * if (denied) return denied;
 * ```
 */
export async function adminGuard(): Promise<NextResponse | null> {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
