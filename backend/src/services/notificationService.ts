import { prisma } from '../db';
import { NotificationType } from '@prisma/client';

/**
 * Notification abstraction. Local dev uses a console provider; swap in a
 * real email/push provider in production behind this same interface.
 */
export const NotificationService = {
  async send(userId: string, type: NotificationType, title: string, body: string) {
    const n = await prisma.notification.create({ data: { userId, type, title, body } });
    console.log(`[notify] -> user:${userId} [${type}] ${title}`);
    return n;
  },
};
