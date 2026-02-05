/**
 * Tests for execSafe utility and sanitizeNotificationText function
 */
import { describe, it, expect } from 'vitest';
import { sanitizeNotificationText } from '../../src/utils/execSafe.js';

describe('sanitizeNotificationText', () => {
  describe('Control character removal', () => {
    it('should remove null character (0x00)', () => {
      const input = 'Hello\x00World';
      const result = sanitizeNotificationText(input);
      expect(result).toBe('HelloWorld');
    });

    it('should preserve newlines', () => {
      const input = 'Line1\nLine2\nLine3';
      const result = sanitizeNotificationText(input);
      expect(result).toBe('Line1\nLine2\nLine3');
    });

    it('should preserve tabs', () => {
      const input = 'Column1\tColumn2';
      const result = sanitizeNotificationText(input);
      expect(result).toBe('Column1\tColumn2');
    });
  });

  describe('Length limiting', () => {
    it('should limit text to default max length (200)', () => {
      const input = 'a'.repeat(250);
      const result = sanitizeNotificationText(input);
      expect(result.length).toBe(200);
      expect(result).toBe('a'.repeat(197) + '...');
    });

    it('should limit text to custom max length', () => {
      const input = 'b'.repeat(100);
      const result = sanitizeNotificationText(input, 50);
      expect(result.length).toBe(50);
      expect(result).toBe('b'.repeat(47) + '...');
    });

    it('should not add ellipsis if text is under max length', () => {
      const input = 'Short text';
      const result = sanitizeNotificationText(input, 50);
      expect(result).toBe('Short text');
      expect(result).not.toContain('...');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string', () => {
      const result = sanitizeNotificationText('');
      expect(result).toBe('');
    });

    it('should handle Unicode characters', () => {
      const input = 'Hello 世界 🌍 مرحبا';
      const result = sanitizeNotificationText(input);
      expect(result).toBe('Hello 世界 🌍 مرحبا');
    });

    it('should handle special ASCII characters', () => {
      const input = 'Test!@#$%^&*()_+-=[]{}|;:,.<>?';
      const result = sanitizeNotificationText(input);
      expect(result).toBe('Test!@#$%^&*()_+-=[]{}|;:,.<>?');
    });
  });

  describe('Security: Injection prevention', () => {
    it('should remove null byte injection attempt', () => {
      const malicious = 'Title\x00;rm -rf /';
      const result = sanitizeNotificationText(malicious);
      expect(result).toBe('Title;rm -rf /');
      expect(result).not.toContain('\x00');
    });
  });
});
