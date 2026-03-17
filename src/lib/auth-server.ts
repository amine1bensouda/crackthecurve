import { cookies } from 'next/headers';
import { prisma } from './db';
import { verifySignedSessionToken } from './auth-utils';

/**
 * Récupère l'utilisateur à partir d'un session token signé (HMAC-SHA256).
 * Vérifie la signature et l'expiration avant d'interroger la DB.
 * Utilisé par les route handlers qui appellent cookies() eux-mêmes en premier.
 */
export async function getUserBySessionToken(sessionToken: string | undefined) {
  if (!sessionToken) return null;

  // Vérifier la signature HMAC et extraire le userId
  const userId = verifySignedSessionToken(sessionToken);
  if (!userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  } catch (error) {
    console.error('Error getting user from session:', error);
    return null;
  }
}

/**
 * Récupère l'utilisateur actuel depuis la session (appel à cookies() ici).
 */
export async function getCurrentUserFromSession() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    return getUserBySessionToken(sessionToken);
  } catch (error) {
    console.error('Error getting user from session:', error);
    return null;
  }
}

/**
 * Vérifie si l'utilisateur est authentifié
 */
export async function requireAuth() {
  const user = await getCurrentUserFromSession();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}
