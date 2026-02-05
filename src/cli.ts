#!/usr/bin/env node

/**
 * Claude Code Alarm Plugin CLI
 *
 * Command-line tool for triggering notifications from Hook scripts or manual invocation.
 * Usage:
 *   node notify.js --trigger askUserQuestion [--message "Custom message"]
 *   node notify.js --trigger permissionRequest
 */

import { notify } from './notify.js';

interface CliArgs {
  trigger?: string;
  message?: string;
  cwd?: string;
  help?: boolean;
}

/**
 * Parse command-line arguments
 */
function parseArgs(): CliArgs {
  const args: CliArgs = {};

  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];

    if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else if (arg.startsWith('--trigger=')) {
      args.trigger = arg.split('=')[1];
    } else if (arg.startsWith('--message=')) {
      args.message = arg.split('=')[1];
    } else if (arg.startsWith('--cwd=')) {
      args.cwd = arg.split('=')[1];
    } else if (arg === '--trigger' && i + 1 < process.argv.length) {
      args.trigger = process.argv[++i];
    } else if (arg === '--message' && i + 1 < process.argv.length) {
      args.message = process.argv[++i];
    } else if (arg === '--cwd' && i + 1 < process.argv.length) {
      args.cwd = process.argv[++i];
    }
  }

  return args;
}

/**
 * Print help message
 */
function printHelp(): void {
  console.log(`
Claude Code Alarm Plugin CLI

Usage:
  plugin-alarm --trigger <trigger-type> [--message "<custom-message>"] [--cwd "<directory>"]

Options:
  --trigger <type>      Trigger type (required)
                        - askUserQuestion: Waiting for user answer
                        - permissionRequest: Requesting permission
                        - taskComplete: Task completed
                        - error: Error occurred

  --message <text>      Custom notification message (optional)
                        If not provided, default message for trigger type is used

  --cwd <directory>     Working directory for instance identification (optional)
                        Defaults to current working directory

  --help, -h           Show this help message

Examples:
  # Basic usage
  plugin-alarm --trigger askUserQuestion

  # With custom message
  plugin-alarm --trigger permissionRequest --message "Need your approval to modify files"

  # With specific working directory
  plugin-alarm --trigger taskComplete --cwd "/home/user/project"

  # With both options
  plugin-alarm --trigger error --message "Build failed" --cwd "/home/user/project"
`);
}

/**
 * Map trigger type to default message
 */
function getTriggerMessage(trigger: string): string {
  const triggerMessages: Record<string, string> = {
    askUserQuestion: 'Claude Code is waiting for your answer to a question',
    permissionRequest: 'Claude Code is requesting permission to proceed',
    taskComplete: 'Claude Code has completed a task',
    error: 'Claude Code encountered an error',
  };

  return triggerMessages[trigger] || 'Claude Code is waiting for your input';
}

/**
 * Validate trigger type
 */
function isValidTrigger(trigger: string | undefined): boolean {
  if (!trigger) return false;

  const validTriggers = ['askUserQuestion', 'permissionRequest', 'taskComplete', 'error'];
  return validTriggers.includes(trigger);
}

/**
 * Main CLI entry point
 */
async function main(): Promise<void> {
  const args = parseArgs();

  // Show help if requested
  if (args.help) {
    printHelp();
    process.exit(0);
  }

  // Validate trigger
  if (!isValidTrigger(args.trigger)) {
    console.error('Error: --trigger is required and must be one of:');
    console.error('  - askUserQuestion');
    console.error('  - permissionRequest');
    console.error('  - taskComplete');
    console.error('  - error');
    console.error('');
    console.error('Use --help for more information');
    process.exit(1);
  }

  try {
    // Determine message
    const message = args.message || getTriggerMessage(args.trigger!);

    // Send notification
    await notify({
      message,
      trigger: args.trigger,
      cwd: args.cwd,
    });

    process.exit(0);
  } catch (error) {
    console.error('Error sending notification:', error);
    process.exit(1);
  }
}

// Run CLI
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
