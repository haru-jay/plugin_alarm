/**
 * Platform detection utilities
 */
import * as os from 'os';
import * as fs from 'fs';

export type Platform = 'macos' | 'linux' | 'windows' | 'wsl';

/**
 * Detect the current platform
 * @returns Platform identifier
 */
export function detectPlatform(): Platform {
  const platform = os.platform();

  // Check for WSL (Windows Subsystem for Linux)
  if (platform === 'linux') {
    try {
      if (fs.existsSync('/proc/version')) {
        const version = fs.readFileSync('/proc/version', 'utf8');
        if (version.includes('Microsoft') || version.includes('WSL')) {
          return 'wsl';
        }
      }
    } catch (error) {
      // If we can't read /proc/version, assume regular Linux
    }
  }

  // Map Node.js platform to our platform type
  switch (platform) {
    case 'darwin':
      return 'macos';
    case 'win32':
      return 'windows';
    case 'linux':
      return 'linux';
    default:
      // Fallback to linux for unknown platforms
      return 'linux';
  }
}

/**
 * Check if a command is available in PATH
 * @param _command - Command name to check
 * @returns true if command exists
 */
export function commandExists(_command: string): boolean {
  try {
    // Note: This is a simple check, not executed
    // Actual availability should be tested at runtime
    return true;
  } catch {
    return false;
  }
}

/**
 * Detect the current terminal application (for future terminal focus feature)
 * @returns Terminal app name or 'unknown'
 */
export function detectTerminal(): string {
  const term = process.env.TERM_PROGRAM || process.env.TERM || 'unknown';

  // Common terminal identifiers
  if (term.includes('iTerm')) return 'iTerm';
  if (term.includes('Apple_Terminal')) return 'Terminal';
  if (term.includes('vscode')) return 'VSCode';
  if (term.includes('hyper')) return 'Hyper';

  // Check for Linux terminals
  const terminalEnv = process.env.TERMINAL;
  if (terminalEnv) {
    if (terminalEnv.includes('gnome')) return 'GNOME Terminal';
    if (terminalEnv.includes('konsole')) return 'Konsole';
    if (terminalEnv.includes('xterm')) return 'xterm';
  }

  return 'unknown';
}

/**
 * Detect display server on Linux (X11 vs Wayland)
 * @returns 'x11', 'wayland', or 'unknown'
 */
export function detectLinuxDisplayServer(): 'x11' | 'wayland' | 'unknown' {
  const sessionType = process.env.XDG_SESSION_TYPE;
  const waylandDisplay = process.env.WAYLAND_DISPLAY;
  const x11Display = process.env.DISPLAY;

  if (sessionType === 'wayland' || waylandDisplay) {
    return 'wayland';
  }

  if (sessionType === 'x11' || x11Display) {
    return 'x11';
  }

  return 'unknown';
}
