import AdminCommentsManager from '@/components/Admin/AdminCommentsManager';

export const dynamic = 'force-dynamic';

export default function AdminCommentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Gestion des commentaires
        </h1>
        <p className="text-gray-600">
          Approuvez, désapprouvez ou supprimez les commentaires des utilisateurs.
        </p>
      </div>
      <AdminCommentsManager />
    </div>
  );
}
