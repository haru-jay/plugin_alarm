/**
 * Claude Code Alarm Plugin
 *
 * Main entry point for the plugin
 */
export { notify } from './notify.js';
export { loadConfig } from './config.js';
export { detectPlatform } from './detector.js';
export { getInstanceIdentifier } from './identifier.js';

export type { PluginConfig } from './config.js';
export type { NotifyOptions } from './notify.js';
export type { Platform } from './detector.js';
export type { InstanceInfo } from './identifier.js';
