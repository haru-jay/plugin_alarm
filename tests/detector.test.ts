/**
 * Tests for platform detection utilities
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('os');
vi.mock('fs');

import * as os from 'os';
import * as fs from 'fs';
import { detectPlatform, detectTerminal, detectLinuxDisplayServer } from '../src/detector.js';

describe('Platform Detection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('detectPlatform', () => {
    it('should detect macOS when os.platform() returns "darwin"', () => {
      vi.mocked(os.platform).mockReturnValue('darwin');
      expect(detectPlatform()).toBe('macos');
    });

    it('should detect Windows when os.platform() returns "win32"', () => {
      vi.mocked(os.platform).mockReturnValue('win32');
      expect(detectPlatform()).toBe('windows');
    });

    it('should detect Linux when os.platform() returns "linux"', () => {
      vi.mocked(os.platform).mockReturnValue('linux');
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('Linux version 5.10.0' as any);
      expect(detectPlatform()).toBe('linux');
    });

    it('should detect WSL when /proc/version contains "Microsoft"', () => {
      vi.mocked(os.platform).mockReturnValue('linux');
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('5.10.0-1-generic-WSL2 (Microsoft)' as any);
      expect(detectPlatform()).toBe('wsl');
    });

    it('should detect WSL when /proc/version contains "WSL"', () => {
      vi.mocked(os.platform).mockReturnValue('linux');
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('Linux version 5.10.16.3-WSL2' as any);
      expect(detectPlatform()).toBe('wsl');
    });

    it('should fallback to linux for unknown platforms', () => {
      vi.mocked(os.platform).mockReturnValue('freebsd' as any);
      expect(detectPlatform()).toBe('linux');
    });
  });

  describe('detectTerminal', () => {
    beforeEach(() => {
      delete process.env.TERM_PROGRAM;
      delete process.env.TERM;
      delete process.env.TERMINAL;
    });

    afterEach(() => {
      delete process.env.TERM_PROGRAM;
      delete process.env.TERM;
      delete process.env.TERMINAL;
    });

    it('should detect iTerm from TERM_PROGRAM', () => {
      process.env.TERM_PROGRAM = 'iTerm.app';
      expect(detectTerminal()).toBe('iTerm');
    });

    it('should detect VSCode from TERM_PROGRAM', () => {
      process.env.TERM_PROGRAM = 'vscode';
      expect(detectTerminal()).toBe('VSCode');
    });

    it('should return unknown if no terminal env is set', () => {
      expect(detectTerminal()).toBe('unknown');
    });
  });

  describe('detectLinuxDisplayServer', () => {
    beforeEach(() => {
      delete process.env.XDG_SESSION_TYPE;
      delete process.env.WAYLAND_DISPLAY;
      delete process.env.DISPLAY;
    });

    afterEach(() => {
      delete process.env.XDG_SESSION_TYPE;
      delete process.env.WAYLAND_DISPLAY;
      delete process.env.DISPLAY;
    });

    it('should detect Wayland from XDG_SESSION_TYPE', () => {
      process.env.XDG_SESSION_TYPE = 'wayland';
      expect(detectLinuxDisplayServer()).toBe('wayland');
    });

    it('should detect X11 from XDG_SESSION_TYPE', () => {
      process.env.XDG_SESSION_TYPE = 'x11';
      expect(detectLinuxDisplayServer()).toBe('x11');
    });

    it('should detect X11 from DISPLAY variable', () => {
      process.env.DISPLAY = ':0';
      expect(detectLinuxDisplayServer()).toBe('x11');
    });

    it('should return unknown when no display variables are set', () => {
      expect(detectLinuxDisplayServer()).toBe('unknown');
    });
  });
});
