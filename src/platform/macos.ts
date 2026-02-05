/**
 * macOS notification implementation using Notification Center
 */
import notifier from 'node-notifier';
import { sanitizeNotificationText } from '../utils/execSafe.js';

export interface MacOSNotificationOptions {
  title: string;
  subtitle?: string;
  message: string;
  sound?: boolean;
}

/**
 * Send notification on macOS using Notification Center
 */
export async function notifyMacOS(options: MacOSNotificationOptions): Promise<void> {
  const { title, subtitle, message, sound = true } = options;

  // Sanitize inputs
  const sanitizedTitle = sanitizeNotificationText(title, 100);
  const sanitizedSubtitle = subtitle ? sanitizeNotificationText(subtitle, 150) : undefined;
  const sanitizedMessage = sanitizeNotificationText(message, 200);

  return new Promise((resolve, reject) => {
    notifier.notify(
      {
        title: sanitizedTitle,
        subtitle: sanitizedSubtitle,
        message: sanitizedMessage,
        sound: sound,
        // Wait is not used in MVP to avoid blocking
        wait: false,
      },
      (err, response) => {
        if (err) {
          reject(new Error(`macOS notification failed: ${err.message}`));
        } else {
          resolve();
        }
      }
    );
  });
}
