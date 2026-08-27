import { classifyPrismaError } from '@/lib/sync/db-error-message';
import { isSafeModeEnabled } from '@/lib/runtime-flags';

export function getAdminDashboardFallbackMessage(lastError: unknown | null): string {
  if (isSafeModeEnabled()) {
    return 'SAFE_MODE=1 in .env: remove this variable then restart the application.';
  }

  if (lastError) {
    const kind = classifyPrismaError(lastError);
    if (kind === 'missing_migration') {
      return 'Missing migrations. Run: npx prisma db push && npm run build && pm2 restart.';
    }
    if (kind === 'auth') {
      return 'PostgreSQL rejected a query. Check DATABASE_URL credentials.';
    }
  }

  return 'Some dashboard data could not be loaded. Check application logs.';
}
