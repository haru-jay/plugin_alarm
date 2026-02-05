/**
 * Configuration management for plugin-alarm
 */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { InstanceIdentifierType } from './identifier.js';
import { WSLConfig } from './platform/wsl.js';

export interface PluginConfig {
  enabled: boolean;
  delaySeconds: number;
  notifications: {
    desktop: boolean;
    sound: boolean;
    soundFile: string | null;
  };
  triggers: {
    askUserQuestion: boolean;
    permissionRequest: boolean;
    taskComplete: boolean;
    error: boolean;
  };
  instanceIdentifier: InstanceIdentifierType;
  showFullPathInSubtitle: boolean;
  wsl?: WSLConfig;
  cooldownSeconds?: number;
}

const DEFAULT_CONFIG: PluginConfig = {
  enabled: true,
  delaySeconds: 5,
  notifications: {
    desktop: true,
    sound: true,
    soundFile: null,
  },
  triggers: {
    askUserQuestion: true,
    permissionRequest: true,
    taskComplete: false,
    error: false,
  },
  instanceIdentifier: 'projectName',
  showFullPathInSubtitle: true,
  wsl: {
    preferredMethod: 'auto',
    fallbackEnabled: true,
  },
  cooldownSeconds: 10,
};

/**
 * Load plugin configuration from Claude Code settings
 */
export function loadConfig(): PluginConfig {
  try {
    const settingsPath = path.join(os.homedir(), '.claude', 'settings.json');

    if (!fs.existsSync(settingsPath)) {
      return DEFAULT_CONFIG;
    }

    const settingsContent = fs.readFileSync(settingsPath, 'utf8');
    const settings = JSON.parse(settingsContent);

    // Extract plugin-alarm config
    const pluginConfig = settings.pluginConfigs?.['plugin-alarm@your-marketplace'];

    if (!pluginConfig) {
      return DEFAULT_CONFIG;
    }

    // Merge with defaults
    return {
      ...DEFAULT_CONFIG,
      ...pluginConfig,
      notifications: {
        ...DEFAULT_CONFIG.notifications,
        ...pluginConfig.notifications,
      },
      triggers: {
        ...DEFAULT_CONFIG.triggers,
        ...pluginConfig.triggers,
      },
      wsl: {
        ...DEFAULT_CONFIG.wsl,
        ...pluginConfig.wsl,
      },
    };
  } catch (error) {
    console.error('Failed to load config, using defaults:', error);
    return DEFAULT_CONFIG;
  }
}

/**
 * Get the current working directory from command line args or environment
 */
export function getCurrentWorkingDirectory(): string {
  // Check if --cwd argument was passed
  const cwdArg = process.argv.find((arg) => arg.startsWith('--cwd='));
  if (cwdArg) {
    return cwdArg.split('=')[1];
  }

  // Fallback to process.cwd()
  return process.cwd();
}
