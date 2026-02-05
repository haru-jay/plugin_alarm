/**
 * Main notification logic - platform-agnostic notification dispatcher
 */
import { detectPlatform } from './detector.js';
import { getInstanceIdentifier, formatNotificationMessage } from './identifier.js';
import { loadConfig, getCurrentWorkingDirectory } from './config.js';
import { notifyMacOS } from './platform/macos.js';
import { notifyLinux } from './platform/linux.js';
import { notifyWindows } from './platform/windows.js';
import { notifyWSL } from './platform/wsl.js';

export interface NotifyOptions {
  message: string;
  trigger?: string;
  cwd?: string;
}

// Cooldown tracking
let lastNotificationTime = 0;
let pendingNotifications = new Map<string, NodeJS.Timeout>();

/**
 * Get notification key for deduplication
 */
function getNotificationKey(trigger: string, cwd: string): string {
  return `${trigger}:${cwd}`;
}

/**
 * Send notification using the appropriate platform method
 */
export async function notify(options: NotifyOptions): Promise<void> {
  const config = loadConfig();

  // Check if plugin is enabled
  if (!config.enabled) {
    return;
  }

  // Check if this trigger type is enabled
  const trigger = options.trigger || 'unknown';
  const triggerConfig = config.triggers as Record<string, boolean>;
  if (trigger !== 'unknown' && triggerConfig[trigger] === false) {
    console.log(`Notification skipped - trigger '${trigger}' is disabled`);
    return;
  }

  // Get working directory
  const cwd = options.cwd || getCurrentWorkingDirectory();
  const notificationKey = getNotificationKey(trigger, cwd);

  // Check cooldown
  const now = Date.now();
  const cooldownMs = (config.cooldownSeconds || 10) * 1000;
  if (now - lastNotificationTime < cooldownMs) {
    console.log('Notification skipped due to cooldown');
    return;
  }

  // Cancel any pending notification with the same key
  const existingTimeout = pendingNotifications.get(notificationKey);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
    pendingNotifications.delete(notificationKey);
  }

  // Apply delay before sending notification
  const delayMs = (config.delaySeconds || 5) * 1000;

  const timeoutId = setTimeout(async () => {
    pendingNotifications.delete(notificationKey);

    // Update last notification time
    lastNotificationTime = Date.now();

    // Get instance identifier
    const instanceInfo = getInstanceIdentifier(config.instanceIdentifier, cwd);

    // Format message
    const message = formatNotificationMessage(options.message, instanceInfo, false);

    // Detect platform
    const platform = detectPlatform();

    try {
      // Play sound if enabled
      if (config.notifications.sound) {
        playBeep();
      }

      // Send desktop notification if enabled
      if (config.notifications.desktop) {
        switch (platform) {
          case 'macos':
            await notifyMacOS({
              title: instanceInfo.title,
              subtitle: config.showFullPathInSubtitle ? instanceInfo.subtitle : undefined,
              message,
              sound: false, // We already played beep above
            });
            break;

          case 'linux':
            await notifyLinux({
              title: instanceInfo.title,
              subtitle: config.showFullPathInSubtitle ? instanceInfo.subtitle : undefined,
              message,
              sound: false,
            });
            break;

          case 'windows':
            await notifyWindows({
              title: instanceInfo.title,
              subtitle: config.showFullPathInSubtitle ? instanceInfo.subtitle : undefined,
              message,
              sound: false,
            });
            break;

          case 'wsl':
            await notifyWSL({
              title: instanceInfo.title,
              message: config.showFullPathInSubtitle
                ? `${instanceInfo.subtitle}\n\n${message}`
                : message,
              config: config.wsl,
            });
            break;
        }
      }
    } catch (error) {
      console.error('Notification failed:', error);
      // Don't throw - notification failure should not break Claude Code
    }
  }, delayMs);

  // Store pending notification timeout for potential cancellation
  pendingNotifications.set(notificationKey, timeoutId);
}

/**
 * Play a simple beep sound
 */
function playBeep(): void {
  try {
    // ASCII bell character
    process.stdout.write('\x07');
  } catch (error) {
    // Ignore beep errors
  }
}

/**
 * CLI entry point for hook execution
 */
export async function main(): Promise<void> {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const triggerArg = args.find((arg) => arg.startsWith('--trigger='));
  const trigger = triggerArg ? triggerArg.split('=')[1] : 'unknown';

  // Map trigger to message
  let message = 'Claude Code is waiting for your input';

  switch (trigger) {
    case 'askUserQuestion':
      message = 'Claude Code is waiting for your answer to a question';
      break;
    case 'permissionRequest':
      message = 'Claude Code is requesting permission to proceed';
      break;
    case 'taskComplete':
      message = 'Claude Code has completed a task';
      break;
    case 'error':
      message = 'Claude Code encountered an error';
      break;
  }

  // Send notification
  await notify({ message, trigger });
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Notification error:', error);
    process.exit(1);
  });
}
