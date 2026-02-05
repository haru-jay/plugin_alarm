# Claude Code Alarm Plugin

A TypeScript-based notification plugin for Claude Code that alerts users when Claude is waiting for input, permission, or when tasks complete.

**Version**: 1.0.0 (MVP)
**Status**: Ready for testing
**License**: MIT

## Overview

The Claude Code Alarm Plugin detects when Claude Code needs user interaction and sends notifications through multiple channels (desktop notifications, sound alerts) across all platforms (macOS, Linux, Windows, WSL).

## Quick Start

```bash
# 1. Build
npm install && npm run build

# 2. Install
mkdir -p ~/.claude/plugins/plugin-alarm
cp -r dist/ ~/.claude/plugins/plugin-alarm/

# 3. Test
node ~/.claude/plugins/plugin-alarm/dist/cli.js --trigger askUserQuestion
```

## Features

- Desktop notifications (macOS, Linux, Windows, WSL)
- System sound alerts
- CLI tool for manual and hook-based triggering
- Configurable delay and cooldown
- Cross-platform support
