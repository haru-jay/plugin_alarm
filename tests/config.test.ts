/**
 * Tests for configuration management
 * Focus: Config loading, defaults, and merging logic
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

vi.mock('fs');
vi.mock('path');
vi.mock('os');

import { loadConfig, getCurrentWorkingDirectory, PluginConfig } from '../src/config.js';

describe('Configuration Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.CLAUDE_CWD;
  });

  afterEach(() => {
    delete process.env.CLAUDE_CWD;
  });

  describe('loadConfig', () => {
    describe('Default config fallback', () => {
      it('should return default config when settings file does not exist', () => {
        vi.mocked(os.homedir).mockReturnValue('/home/user');
        vi.mocked(path.join).mockReturnValue('/home/user/.claude/settings.json');
        vi.mocked(fs.existsSync).mockReturnValue(false);

        const config = loadConfig();

        expect(config.enabled).toBe(true);
        expect(config.delaySeconds).toBe(5);
        expect(config.cooldownSeconds).toBe(10);
        expect(config.notifications.desktop).toBe(true);
        expect(config.notifications.sound).toBe(true);
        expect(config.triggers.askUserQuestion).toBe(true);
        expect(config.triggers.permissionRequest).toBe(true);
      });
    });

    describe('Config file loading', () => {
      it('should load config from settings.json when it exists', () => {
        const settingsContent = JSON.stringify({
          pluginConfigs: {
            'plugin-alarm@your-marketplace': {
              enabled: false,
              delaySeconds: 10,
            },
          },
        });

        vi.mocked(os.homedir).mockReturnValue('/home/user');
        vi.mocked(path.join).mockReturnValue('/home/user/.claude/settings.json');
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readFileSync).mockReturnValue(settingsContent);

        const config = loadConfig();

        expect(config.enabled).toBe(false);
        expect(config.delaySeconds).toBe(10);
      });

      it('should merge user config with defaults', () => {
        const settingsContent = JSON.stringify({
          pluginConfigs: {
            'plugin-alarm@your-marketplace': {
              delaySeconds: 15,
              notifications: {
                desktop: false,
              },
            },
          },
        });

        vi.mocked(os.homedir).mockReturnValue('/home/user');
        vi.mocked(path.join).mockReturnValue('/home/user/.claude/settings.json');
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readFileSync).mockReturnValue(settingsContent);

        const config = loadConfig();

        expect(config.delaySeconds).toBe(15);
        expect(config.notifications.desktop).toBe(false);
        expect(config.notifications.sound).toBe(true);
        expect(config.enabled).toBe(true);
      });
    });

    describe('Error handling', () => {
      it('should return default config if settings file cannot be read', () => {
        vi.mocked(os.homedir).mockReturnValue('/home/user');
        vi.mocked(path.join).mockReturnValue('/home/user/.claude/settings.json');
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readFileSync).mockImplementation(() => {
          throw new Error('Permission denied');
        });

        const config = loadConfig();

        expect(config.enabled).toBe(true);
        expect(config.delaySeconds).toBe(5);
      });

      it('should return default config if JSON is invalid', () => {
        vi.mocked(os.homedir).mockReturnValue('/home/user');
        vi.mocked(path.join).mockReturnValue('/home/user/.claude/settings.json');
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readFileSync).mockReturnValue('{ invalid json }');

        const config = loadConfig();

        expect(config.enabled).toBe(true);
        expect(config.delaySeconds).toBe(5);
      });
    });
  });

  describe('getCurrentWorkingDirectory', () => {
    beforeEach(() => {
      process.argv = ['node', 'script.js'];
    });

    it('should return cwd from --cwd argument if provided', () => {
      process.argv = ['node', 'script.js', '--cwd=/custom/path'];

      const cwd = getCurrentWorkingDirectory();

      expect(cwd).toBe('/custom/path');
    });

    it('should fallback to process.cwd() when --cwd is not provided', () => {
      process.argv = ['node', 'script.js'];

      const cwd = getCurrentWorkingDirectory();

      expect(typeof cwd).toBe('string');
      expect(cwd.length).toBeGreaterThan(0);
    });
  });
});
