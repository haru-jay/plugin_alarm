/**
 * Instance identification utilities for multi-instance support
 */
import * as path from 'path';

export type InstanceIdentifierType = 'projectName' | 'fullPath' | 'pid' | 'sessionId';

export interface InstanceInfo {
  title: string;
  subtitle?: string;
  sessionInfo?: string;
}

/**
 * Get instance identifier based on configuration
 * @param type - Type of identifier to generate
 * @param cwd - Current working directory (defaults to process.cwd())
 * @returns Instance identification info
 */
export function getInstanceIdentifier(
  type: InstanceIdentifierType = 'projectName',
  cwd?: string
): InstanceInfo {
  const workingDir = cwd || process.cwd();
  const projectName = path.basename(workingDir);

  switch (type) {
    case 'fullPath':
      return {
        title: `Claude Code - ${projectName}`,
        subtitle: workingDir,
      };

    case 'projectName':
      return {
        title: `Claude Code - ${projectName}`,
        subtitle: workingDir,
      };

    case 'pid':
      return {
        title: `Claude Code - ${projectName}`,
        subtitle: workingDir,
        sessionInfo: `PID: ${process.pid}`,
      };

    case 'sessionId':
      const tmuxPane = process.env.TMUX_PANE;
      const screenSession = process.env.STY;

      let sessionInfo = '';
      if (tmuxPane) {
        sessionInfo = `tmux:${tmuxPane}`;
      } else if (screenSession) {
        sessionInfo = `screen:${screenSession}`;
      } else {
        sessionInfo = `PID: ${process.pid}`;
      }

      return {
        title: `Claude Code - ${projectName}`,
        subtitle: workingDir,
        sessionInfo,
      };

    default:
      return {
        title: `Claude Code - ${projectName}`,
        subtitle: workingDir,
      };
  }
}

/**
 * Format notification message with instance information
 * @param message - Base notification message
 * @param instanceInfo - Instance identification info
 * @param includeSessionInfo - Whether to include session info in message
 * @returns Formatted message
 */
export function formatNotificationMessage(
  message: string,
  instanceInfo: InstanceInfo,
  includeSessionInfo: boolean = false
): string {
  if (includeSessionInfo && instanceInfo.sessionInfo) {
    return `${message}\n\n${instanceInfo.sessionInfo}`;
  }

  return message;
}
