/**
 * Windows notification implementation using Toast Notifications
 */
import notifier from 'node-notifier';
import { sanitizeNotificationText } from '../utils/execSafe.js';

export interface WindowsNotificationOptions {
  title: string;
  message: string;
  subtitle?: string;
  sound?: boolean;
}

/**
 * Send notification on Windows using Toast Notifications
 */
export async function notifyWindows(options: WindowsNotificationOptions): Promise<void> {
  const { title, message, subtitle, sound = true } = options;

  // Sanitize inputs
  const sanitizedTitle = sanitizeNotificationText(title, 100);
  const sanitizedMessage = sanitizeNotificationText(message, 200);

  // Combine subtitle into message if provided
  let fullMessage = sanitizedMessage;
  if (subtitle) {
    const sanitizedSubtitle = sanitizeNotificationText(subtitle, 150);
    fullMessage = `${sanitizedSubtitle}\n\n${sanitizedMessage}`;
  }

  return new Promise((resolve, reject) => {
    notifier.notify(
      {
        title: sanitizedTitle,
        message: fullMessage,
        sound: sound,
        wait: false,
        // Windows-specific options
        appID: 'Claude Code',
      },
      (err, response) => {
        if (err) {
          reject(new Error(`Windows notification failed: ${err.message}`));
        } else {
          resolve();
        }
      }
    );
  });
}
