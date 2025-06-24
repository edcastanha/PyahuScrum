import { Activity } from '../../entities/Activity';
import { storageService } from '../storage/storageService';
import { mockActivities } from '../mock/activityMock';

const ACTIVITIES_KEY = 'devportfolio_activities';

export class ActivityService {
  getActivities(): Activity[] {
    const activities = storageService.getItem<Activity[]>(ACTIVITIES_KEY);
    return activities || this.initializeActivities();
  }

  addActivity(activity: Omit<Activity, 'id' | 'timestamp'>): Activity {
    const activities = this.getActivities();
    const newActivity: Activity = {
      ...activity,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    };
    
    activities.unshift(newActivity); // Add to the beginning
    
    // Keep only the most recent 50 activities
    const trimmedActivities = activities.slice(0, 50);
    storageService.setItem(ACTIVITIES_KEY, trimmedActivities);
    
    return newActivity;
  }

  getActivityStats() {
    return {
      activeStories: 5, // Valor simulado, futuramente virá de um serviço de histórias
    };
  }

  private initializeActivities(): Activity[] {
    storageService.setItem(ACTIVITIES_KEY, mockActivities);
    return mockActivities;
  }
}

export const activityService = new ActivityService();
