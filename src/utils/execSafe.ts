/**
 * Safe command execution utility using execFile to prevent command injection
 */
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export interface ExecResult {
  stdout: string;
  stderr: string;
}

/**
 * Safely execute a command using execFile (prevents shell injection)
 * @param command - Command to execute (e.g., 'wsl-notify-send.exe')
 * @param args - Array of arguments (safely passed without shell interpretation)
 * @param options - Execution options
 * @returns Promise with stdout and stderr
 * @throws Error if command fails or times out
 */
export async function execSafe(
  command: string,
  args: string[],
  options?: { timeout?: number }
): Promise<ExecResult> {
  try {
    const result = await execFileAsync(command, args, {
      timeout: options?.timeout || 3000,
      windowsHide: true, // Hide console window on Windows
    });

    return {
      stdout: result.stdout,
      stderr: result.stderr,
    };
  } catch (error: any) {
    // Handle timeout and other errors
    const errorMessage = error.code === 'ETIMEDOUT'
      ? `Command timed out: ${command}`
      : `Command failed: ${command} ${args.join(' ')}\n${error.message}`;

    throw new Error(errorMessage);
  }
}

/**
 * Sanitize notification text to prevent issues
 * - Removes control characters
 * - Limits length to prevent overflow
 */
export function sanitizeNotificationText(text: string, maxLength: number = 200): string {
  // Remove control characters (except newlines)
  let sanitized = text.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength - 3) + '...';
  }

  return sanitized;
}
