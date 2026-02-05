/**
 * Tests for WSL platform utilities - XML escaping
 */
import { describe, it, expect } from 'vitest';

/**
 * Mirrored implementation of escapeXml from wsl.ts for direct testing
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

describe('escapeXml', () => {
  describe('Basic XML entity escaping', () => {
    it('should escape ampersand (&)', () => {
      expect(escapeXml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    it('should escape less-than (<)', () => {
      expect(escapeXml('if (a < b)')).toBe('if (a &lt; b)');
    });

    it('should escape greater-than (>)', () => {
      expect(escapeXml('if (a > b)')).toBe('if (a &gt; b)');
    });

    it('should escape double quote (")', () => {
      expect(escapeXml('He said "Hello"')).toBe('He said &quot;Hello&quot;');
    });

    it('should escape single quote (apostrophe)', () => {
      expect(escapeXml("It's a test")).toBe('It&apos;s a test');
    });
  });

  describe('Multiple special characters', () => {
    it('should escape multiple different characters', () => {
      const input = '<tag attr="value">Text & more</tag>';
      const expected = '&lt;tag attr=&quot;value&quot;&gt;Text &amp; more&lt;/tag&gt;';
      expect(escapeXml(input)).toBe(expected);
    });

    it('should handle all five entities together', () => {
      const input = '&<>"\'';
      const expected = '&amp;&lt;&gt;&quot;&apos;';
      expect(escapeXml(input)).toBe(expected);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string', () => {
      expect(escapeXml('')).toBe('');
    });

    it('should handle string with no special characters', () => {
      const input = 'Hello World 123';
      expect(escapeXml(input)).toBe('Hello World 123');
    });
  });

  describe('Security: XML injection prevention', () => {
    it('should prevent XML tag injection', () => {
      const malicious = '<script>alert("XSS")</script>';
      const escaped = escapeXml(malicious);
      expect(escaped).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
      expect(escaped).not.toContain('<script>');
    });
  });
});
