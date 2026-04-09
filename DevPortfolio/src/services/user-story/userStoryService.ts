import { UserStory } from '../../entities/UserStory';
import { storageService } from '../storage/storageService';
import { mockUserStories } from '../mock/userStoryMock';

const USER_STORIES_KEY = 'devportfolio_user_stories';

class UserStoryService {
  private initializeStories(): UserStory[] {
    storageService.setItem(USER_STORIES_KEY, mockUserStories);
    return mockUserStories;
  }

  getUserStories(projectId: string): UserStory[] {
    const allStories = storageService.getItem<UserStory[]>(USER_STORIES_KEY);
    if (!allStories) {
      const initializedStories = this.initializeStories();
      return initializedStories.filter(story => story.projectId === projectId);
    }
    return allStories.filter(story => story.projectId === projectId);
  }

  getAllUserStories(): UserStory[] {
    const allStories = storageService.getItem<UserStory[]>(USER_STORIES_KEY);
    return allStories || this.initializeStories();
  }

  saveUserStory(story: UserStory): UserStory {
    const allStories = this.getAllUserStories();
    const index = allStories.findIndex(s => s.id === story.id);

    if (index >= 0) {
      allStories[index] = { ...story, updatedDate: new Date().toISOString() };
    } else {
      const newStory = {
        ...story,
        id: Date.now(),
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      };
      allStories.push(newStory);
      story = newStory;
    }

    storageService.setItem(USER_STORIES_KEY, allStories);
    return story;
  }

  updateUserStoryStatus(storyId: number, newStatus: 'todo' | 'inprogress' | 'done'): UserStory | undefined {
    const allStories = this.getAllUserStories();
    const storyIndex = allStories.findIndex(s => s.id === storyId);

    if (storyIndex !== -1) {
      allStories[storyIndex].status = newStatus;
      allStories[storyIndex].updatedDate = new Date().toISOString();
      storageService.setItem(USER_STORIES_KEY, allStories);
      return allStories[storyIndex];
    }
    return undefined;
  }
}

export const userStoryService = new UserStoryService();
