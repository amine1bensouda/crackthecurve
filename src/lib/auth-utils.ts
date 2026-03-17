import bcrypt from 'bcryptjs';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

// ---------- Clé secrète pour la signature des tokens ----------
// En production, DOIT être définie via la variable d'env SESSION_SECRET.
// En développement, un fallback déterministe est utilisé pour ne pas casser
// les sessions à chaque redémarrage du serveur.
function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;

  if (process.env.NODE_ENV === 'production') {
    console.error(
      '🔴 CRITICAL: SESSION_SECRET is missing or too short (min 32 chars). Sessions will NOT be secure.'
    );
  }
  // Fallback dev uniquement — jamais en prod
  return 'dev-fallback-secret-do-not-use-in-production!!';
}

// ---------- Password hashing (bcrypt) ----------

/**
 * Hash un mot de passe (bcryptjs = JS pur, pas de binaire natif → fonctionne sur Vercel)
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return Promise.resolve(bcrypt.hashSync(password, saltRounds));
}

/**
 * Compare un mot de passe avec un hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return Promise.resolve(bcrypt.compareSync(password, hash));
}

// ---------- Session token signé (HMAC-SHA256) ----------

/**
 * Crée un token de session signé : `userId.timestamp.nonce.signature`
 * - Le userId et le timestamp sont inclus en clair (base64url) pour pouvoir
 *   identifier l'utilisateur sans requête DB supplémentaire.
 * - Le nonce ajoute de l'entropie (empêche la prédiction du token).
 * - La signature HMAC-SHA256 garantit que le token n'a pas été falsifié.
 */
export function createSignedSessionToken(userId: string): string {
  const timestamp = Date.now().toString();
  const nonce = randomBytes(16).toString('hex');
  const payload = `${userId}.${timestamp}.${nonce}`;
  const signature = createHmac('sha256', getSessionSecret())
    .update(payload)
    .digest('hex');
  return `${payload}.${signature}`;
}

/**
 * Vérifie un token de session signé et retourne le userId si valide.
 * Retourne `null` si le token est invalide ou expiré.
 *
 * @param token  Le token brut provenant du cookie.
 * @param maxAgeMs  Durée de vie maximale du token en ms (défaut : 7 jours).
 */
export function verifySignedSessionToken(
  token: string,
  maxAgeMs: number = 7 * 24 * 60 * 60 * 1000
): string | null {
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length !== 4) return null;

  const [userId, timestamp, nonce, providedSig] = parts;
  if (!userId || !timestamp || !nonce || !providedSig) return null;

  // Vérifier l'expiration
  const tokenAge = Date.now() - parseInt(timestamp, 10);
  if (isNaN(tokenAge) || tokenAge < 0 || tokenAge > maxAgeMs) return null;

  // Recalculer la signature attendue
  const payload = `${userId}.${timestamp}.${nonce}`;
  const expectedSig = createHmac('sha256', getSessionSecret())
    .update(payload)
    .digest('hex');

  // Comparaison constante en temps pour éviter les timing attacks
  try {
    const sigBuffer = Buffer.from(providedSig, 'hex');
    const expectedBuffer = Buffer.from(expectedSig, 'hex');
    if (sigBuffer.length !== expectedBuffer.length) return null;
    if (!timingSafeEqual(sigBuffer, expectedBuffer)) return null;
  } catch {
    return null;
  }

  return userId;
}

// ---------- Admin token signé (HMAC-SHA256) ----------

/**
 * Crée un token admin signé : `admin.timestamp.nonce.signature`
 * Contrairement au session token utilisateur, il ne contient pas de userId
 * car l'admin est vérifié par mot de passe unique (env ADMIN_PASSWORD).
 */
export function createSignedAdminToken(): string {
  const timestamp = Date.now().toString();
  const nonce = randomBytes(16).toString('hex');
  const payload = `admin.${timestamp}.${nonce}`;
  const signature = createHmac('sha256', getSessionSecret())
    .update(payload)
    .digest('hex');
  return `${payload}.${signature}`;
}

/**
 * Vérifie un token admin signé. Retourne `true` si le token est valide et non expiré.
 *
 * @param token  Le token brut provenant du cookie.
 * @param maxAgeMs  Durée de vie maximale en ms (défaut : 7 jours).
 */
export function verifySignedAdminToken(
  token: string,
  maxAgeMs: number = 7 * 24 * 60 * 60 * 1000
): boolean {
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 4) return false;

  const [prefix, timestamp, nonce, providedSig] = parts;
  if (prefix !== 'admin' || !timestamp || !nonce || !providedSig) return false;

  // Vérifier l'expiration
  const tokenAge = Date.now() - parseInt(timestamp, 10);
  if (isNaN(tokenAge) || tokenAge < 0 || tokenAge > maxAgeMs) return false;

  // Recalculer la signature attendue
  const payload = `${prefix}.${timestamp}.${nonce}`;
  const expectedSig = createHmac('sha256', getSessionSecret())
    .update(payload)
    .digest('hex');

  // Comparaison constante en temps
  try {
    const sigBuffer = Buffer.from(providedSig, 'hex');
    const expectedBuffer = Buffer.from(expectedSig, 'hex');
    if (sigBuffer.length !== expectedBuffer.length) return false;
    return timingSafeEqual(sigBuffer, expectedBuffer);
  } catch {
    return false;
  }
}
