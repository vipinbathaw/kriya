import { describe, it, expect } from 'vitest';
import { generateSimpleTags } from './tag-generator.service.js';

describe('generateSimpleTags', () => {
  it('generates tags from title words', () => {
    const tags = generateSimpleTags('My Weekly Grocery Shopping List');
    expect(tags).toContain('weekly');
    expect(tags).toContain('grocery');
    expect(tags).toContain('shopping');
    expect(tags).toContain('list');
  });

  it('excludes stop words', () => {
    const tags = generateSimpleTags('The quick brown fox jumps');
    expect(tags).not.toContain('the');
    expect(tags).toContain('quick');
    expect(tags).toContain('brown');
  });

  it('strips non-alphanumeric characters', () => {
    const tags = generateSimpleTags('Hello, World! Test case');
    expect(tags).toContain('hello');
    expect(tags).toContain('world');
    expect(tags).toContain('test');
    expect(tags).toContain('case');
  });

  it('returns unique tags only', () => {
    const tags = generateSimpleTags('test test test');
    expect(tags).toEqual(['test']);
  });

  it('returns at most 5 tags', () => {
    const tags = generateSimpleTags('one two three four five six seven eight nine ten');
    expect(tags.length).toBeLessThanOrEqual(5);
  });

  it('returns empty array for empty input', () => {
    expect(generateSimpleTags('')).toEqual([]);
  });

  it('returns empty array for stop words only', () => {
    expect(generateSimpleTags('the a an is it')).toEqual([]);
  });

  it('ignores single character words', () => {
    const tags = generateSimpleTags('a b c test');
    expect(tags).toEqual(['test']);
  });
});
