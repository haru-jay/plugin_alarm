/**
 * Linux notification implementation using libnotify (notify-send)
 */
import notifier from 'node-notifier';
import { sanitizeNotificationText } from '../utils/execSafe.js';
import { detectLinuxDisplayServer } from '../detector.js';

export interface LinuxNotificationOptions {
  title: string;
  message: string;
  subtitle?: string;
  sound?: boolean;
}

/**
 * Send notification on Linux using libnotify
 */
export async function notifyLinux(options: LinuxNotificationOptions): Promise<void> {
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

  // Check display server
  const displayServer = detectLinuxDisplayServer();
  if (displayServer === 'unknown') {
    console.warn('Warning: Could not detect display server (X11/Wayland)');
  }

  return new Promise((resolve, reject) => {
    notifier.notify(
      {
        title: sanitizedTitle,
        message: fullMessage,
        sound: sound,
        // Timeout in milliseconds (10 seconds)
        time: 10000,
        wait: false,
      },
      (err, response) => {
        if (err) {
          // Fallback to terminal output if libnotify is not available
          if (err.message.includes('notify-send')) {
            console.error('notify-send not found. Please install libnotify-bin:');
            console.error('  sudo apt-get install libnotify-bin  (Debian/Ubuntu)');
            console.error('  sudo yum install libnotify           (RHEL/CentOS)');
            console.error('  sudo pacman -S libnotify             (Arch Linux)');

            // Fallback to terminal
            fallbackToTerminal(sanitizedTitle, fullMessage);
            resolve();
          } else {
            reject(new Error(`Linux notification failed: ${err.message}`));
          }
        } else {
          resolve();
        }
      }
    );
  });
}

/**
 * Fallback to terminal output if libnotify is not available
 */
function fallbackToTerminal(title: string, message: string): void {
  // System bell
  process.stdout.write('\x07');

  // Visual output
  console.log('\n' + '='.repeat(50));
  console.log(`⚠️  ${title}`);
  console.log('─'.repeat(50));
  console.log(message);
  console.log('='.repeat(50) + '\n');
}
