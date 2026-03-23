import { type NextRequest } from 'next/server';
import { activityDb } from '@/lib/server/activity-db';
import { db } from '@/lib/server/db';
import { apiSuccess, apiError } from '@/lib/server/api-response';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const wantStats = searchParams.get('stats') === 'true';

    if (wantStats) {
      const stats = activityDb.getStats();
      const allUsers = db.getUsers();
      const siswaCount = allUsers.filter((u) => u.role === 'siswa').length;
      const guruCount = allUsers.filter((u) => u.role === 'guru').length;

      return apiSuccess({
        ...stats,
        registeredStudents: siswaCount,
        registeredTeachers: guruCount,
      });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const userId = searchParams.get('userId');

    const activities = userId
      ? activityDb.getActivitiesByUser(userId, limit)
      : activityDb.getActivities(limit, offset);

    const total = activityDb.getTotalCount();

    return apiSuccess({ activities, total });
  } catch (error) {
    return apiError('INTERNAL_ERROR', 500, 'Failed to fetch activities', error instanceof Error ? error.message : String(error));
  }
}
