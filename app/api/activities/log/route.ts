import { type NextRequest } from 'next/server';
import { activityDb, type ActivityType } from '@/lib/server/activity-db';
import { apiSuccess, apiError } from '@/lib/server/api-response';

const VALID_TYPES: ActivityType[] = [
  'login',
  'classroom_join',
  'quiz_complete',
  'pbl_start',
  'classroom_create',
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userName, type, metadata } = body;

    if (!userId || !userName || !type) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'userId, userName, and type are required');
    }

    if (!VALID_TYPES.includes(type)) {
      return apiError('INVALID_REQUEST', 400, `Invalid activity type: ${type}`);
    }

    const activity = activityDb.logActivity(userId, userName, type, metadata);
    return apiSuccess({ activity }, 201);
  } catch (error) {
    return apiError('INTERNAL_ERROR', 500, 'Failed to log activity', error instanceof Error ? error.message : String(error));
  }
}
