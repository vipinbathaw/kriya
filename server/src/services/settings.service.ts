import { settingsRepository } from '../repositories/settings.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { NotFoundError } from '../middleware/errorHandler.js';

export const settingsService = {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User');

    const settings = await settingsRepository.findByUserId(userId);

    return {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      theme: settings?.theme ?? 'system',
    };
  },

  async updateProfile(userId: string, data: { displayName?: string; theme?: string }) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User');

    if (data.displayName) {
      await userRepository.update(userId, { display_name: data.displayName });
    }
    if (data.theme) {
      await settingsRepository.upsert(userId, { theme: data.theme });
    }

    return this.getProfile(userId);
  },
};
