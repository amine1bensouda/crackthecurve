export type DbErrorKind =
  | 'auth'
  | 'connection'
  | 'missing_migration'
  | 'unknown';

export type DbErrorInfo = {
  kind: DbErrorKind;
  message: string;
  hints: string[];
};

function isMissingSchemaError(msg: string): boolean {
  return (
    msg.includes('does not exist') ||
    msg.includes('sync_logs') ||
    msg.includes('source_quiz_id') ||
    msg.includes('is_enabled') ||
    msg.includes('Unknown column') ||
    msg.includes('column') && msg.includes('not exist')
  );
}

function isSupabaseHost(): boolean {
  const url = process.env.DATABASE_URL || '';
  return url.includes('supabase.com') || url.includes('supabase.co');
}

export function classifyPrismaError(error: unknown): DbErrorKind {
  if (!(error instanceof Error)) return 'unknown';
  const msg = error.message;
  if (msg.includes('P1000') || msg.includes('Authentication failed')) return 'auth';
  if (isMissingSchemaError(msg)) return 'missing_migration';
  if (
    msg.includes('ENOTFOUND') ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('connect')
  ) {
    return 'connection';
  }
  return 'unknown';
}

export function formatPrismaDbError(error: unknown): DbErrorInfo {
  const kind = classifyPrismaError(error);
  const raw = error instanceof Error ? error.message : '';

  if (kind === 'missing_migration') {
    return {
      kind,
      message:
        'Schéma Prisma non aligné (ex. colonne quizzes.order ou tables sync manquantes).',
      hints: [
        'Sur le VPS : cd /var/www/school && git pull',
        'chmod +x scripts/vps-migrate-sync.sh && ./scripts/vps-migrate-sync.sh',
        '(Ne pas utiliser migrate deploy seul si erreur P3005 — le script fait le baseline)',
        'npm run build && pm2 restart school',
        'npm run health:db',
      ],
    };
  }

  if (kind === 'auth') {
    return {
      kind,
      message:
        'PostgreSQL a refusé la connexion. Vérifiez DATABASE_URL dans .env (souvent school_user @ localhost:5432/school_db).',
      hints: [
        'Identifiants identiques à ceux configurés dans PostgreSQL sur le VPS',
        'Mot de passe avec caractères spéciaux : encoder en URL',
        'Test : npm run health:db',
      ],
    };
  }

  if (kind === 'connection') {
    const hints = [
      'PostgreSQL : sudo systemctl status postgresql',
      'DATABASE_URL sur ce serveur (localhost:5432)',
      'npm run health:db',
    ];
    if (isSupabaseHost()) {
      hints.unshift('Projet Supabase actif — URL Settings → Database');
    }
    return {
      kind,
      message: 'Impossible de joindre PostgreSQL.',
      hints,
    };
  }

  return {
    kind: 'unknown',
    message: raw || 'Erreur base de données.',
    hints: ['pm2 logs', 'DATABASE_URL dans .env', 'npx prisma migrate deploy'],
  };
}
