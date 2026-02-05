/**
 * WSL (Windows Subsystem for Linux) notification implementation
 * Implements a hierarchical fallback strategy:
 * 1. wsl-notify-send.exe (recommended)
 * 2. PowerShell Toast Notification
 * 3. Terminal bell + text output
 */
import { execSafe, sanitizeNotificationText } from '../utils/execSafe.js';

export interface WSLConfig {
  preferredMethod?: 'auto' | 'wsl-notify-send' | 'powershell';
  fallbackEnabled?: boolean;
}

export interface NotificationOptions {
  title: string;
  message: string;
  config?: WSLConfig;
}

/**
 * Send notification on WSL using the best available method
 */
export async function notifyWSL(options: NotificationOptions): Promise<void> {
  const { title, message, config = {} } = options;
  const preferredMethod = config.preferredMethod || 'auto';
  const fallbackEnabled = config.fallbackEnabled !== false;

  // Sanitize inputs
  const sanitizedTitle = sanitizeNotificationText(title, 100);
  const sanitizedMessage = sanitizeNotificationText(message, 200);

  // Try wsl-notify-send first
  if (preferredMethod === 'auto' || preferredMethod === 'wsl-notify-send') {
    try {
      await notifyViaWslNotifySend(sanitizedTitle, sanitizedMessage);
      return;
    } catch (error) {
      // If this was the preferred method and it failed, throw
      if (preferredMethod === 'wsl-notify-send') {
        console.error('wsl-notify-send failed:', error);
        if (!fallbackEnabled) throw error;
      }
    }
  }

  // Try PowerShell as fallback
  if (preferredMethod === 'auto' || preferredMethod === 'powershell') {
    try {
      await notifyViaPowerShell(sanitizedTitle, sanitizedMessage);
      return;
    } catch (error) {
      // If this was the preferred method and it failed, throw
      if (preferredMethod === 'powershell') {
        console.error('PowerShell notification failed:', error);
        if (!fallbackEnabled) throw error;
      }
    }
  }

  // Final fallback: Terminal bell + text output
  if (fallbackEnabled) {
    notifyViaTerminal(sanitizedTitle, sanitizedMessage);
  } else {
    throw new Error('All WSL notification methods failed');
  }
}

/**
 * Method 1: Use wsl-notify-send.exe (recommended)
 */
async function notifyViaWslNotifySend(title: string, message: string): Promise<void> {
  // wsl-notify-send.exe uses notify-send syntax
  await execSafe('wsl-notify-send.exe', [title, message], { timeout: 3000 });
}

/**
 * Escape special characters for XML
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')   // Must be first
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Method 2: Use PowerShell BurntToast or direct Toast API
 */
async function notifyViaPowerShell(title: string, message: string): Promise<void> {
  // Escape for both PowerShell and XML
  const psEscapedTitle = title.replace(/'/g, "''");
  const psEscapedMessage = message.replace(/'/g, "''");

  // Also escape for XML
  const xmlSafeTitle = escapeXml(psEscapedTitle);
  const xmlSafeMessage = escapeXml(psEscapedMessage);

  // Try BurntToast module first (if installed)
  const burntToastScript = `
    if (Get-Module -ListAvailable -Name BurntToast) {
      New-BurntToastNotification -Text '${psEscapedTitle}', '${psEscapedMessage}'
    } else {
      # Fallback to direct Toast API
      [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
      [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null

      $template = @"
<toast>
  <visual>
    <binding template='ToastGeneric'>
      <text>${xmlSafeTitle}</text>
      <text>${xmlSafeMessage}</text>
    </binding>
  </visual>
</toast>
"@

      $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
      $xml.LoadXml($template)
      $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
      [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('Claude Code').Show($toast)
    }
  `.trim();

  await execSafe('powershell.exe', ['-NoProfile', '-Command', burntToastScript], {
    timeout: 5000, // PowerShell can be slower
  });
}

/**
 * Method 3: Terminal bell + text output (final fallback)
 */
function notifyViaTerminal(title: string, message: string): void {
  // System bell
  process.stdout.write('\x07');

  // Visual output
  console.log('\n' + '='.repeat(50));
  console.log(`⚠️  ${title}`);
  console.log('─'.repeat(50));
  console.log(message);
  console.log('='.repeat(50) + '\n');
}

/**
 * Check if wsl-notify-send is available
 */
export async function isWslNotifySendAvailable(): Promise<boolean> {
  try {
    await execSafe('wsl-notify-send.exe', ['--version'], { timeout: 1000 });
    return true;
  } catch {
    return false;
  }
}
