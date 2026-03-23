import path from 'path';
import { encryptedRead, encryptedWrite } from './encrypted-fs';

export type ActivityType =
  | 'login'
  | 'classroom_join'
  | 'quiz_complete'
  | 'pbl_start'
  | 'classroom_create';

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  type: ActivityType;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

interface ActivityDbSchema {
  activities: Activity[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const ACTIVITY_FILE = path.join(DATA_DIR, 'activities.json');

function readActivities(): ActivityDbSchema {
  return encryptedRead<ActivityDbSchema>(ACTIVITY_FILE, { activities: [] });
}

function writeActivities(data: ActivityDbSchema) {
  encryptedWrite(ACTIVITY_FILE, data);
}

let counter = 0;

export const activityDb = {
  logActivity: (
    userId: string,
    userName: string,
    type: ActivityType,
    metadata?: Record<string, unknown>,
  ): Activity => {
    const data = readActivities();
    const activity: Activity = {
      id: `${Date.now()}-${++counter}`,
      userId,
      userName,
      type,
      metadata,
      timestamp: new Date().toISOString(),
    };
    data.activities.unshift(activity);
    // Keep max 500 activities to avoid unbounded growth
    if (data.activities.length > 500) {
      data.activities = data.activities.slice(0, 500);
    }
    writeActivities(data);
    return activity;
  },

  getActivities: (limit = 50, offset = 0): Activity[] => {
    const data = readActivities();
    return data.activities.slice(offset, offset + limit);
  },

  getActivitiesByUser: (userId: string, limit = 20): Activity[] => {
    const data = readActivities();
    return data.activities.filter((a) => a.userId === userId).slice(0, limit);
  },

  getStats: () => {
    const data = readActivities();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const todayActivities = data.activities.filter((a) => a.timestamp >= todayStart);
    const todayLogins = todayActivities.filter((a) => a.type === 'login');
    const todayQuizzes = todayActivities.filter((a) => a.type === 'quiz_complete');

    // Unique active students today
    const activeStudentsToday = new Set(todayActivities.map((a) => a.userId)).size;

    // Unique students all time
    const uniqueStudentsAllTime = new Set(data.activities.map((a) => a.userId)).size;

    return {
      totalActivities: data.activities.length,
      activitiesToday: todayActivities.length,
      loginsToday: todayLogins.length,
      quizzesToday: todayQuizzes.length,
      activeStudentsToday,
      uniqueStudentsAllTime,
    };
  },

  getTotalCount: (): number => {
    return readActivities().activities.length;
  },
};
