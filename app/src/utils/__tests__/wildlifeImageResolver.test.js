import { describe, it, expect } from 'vitest';
import {
  sanitizeWildlifeImages,
  getWildlifeImageCategory,
  buildWildlifeImageSrc
} from '../wildlifeImageResolver';

describe('wildlifeImageResolver', () => {
  describe('sanitizeWildlifeImages', () => {
    it('should filter out invalid and duplicate image strings', () => {
      const input = [
        '  ',
        'valid_image.jpg',
        'placeholder.png',
        'no-image.jpg',
        'missing.jpg',
        'null',
        'undefined',
        'valid_image.jpg' // duplicate
      ];
      const output = sanitizeWildlifeImages(input);
      expect(output).toEqual(['valid_image.jpg']);
    });
  });

  describe('getWildlifeImageCategory', () => {
    it('should map collection or category correctly to paths', () => {
      expect(getWildlifeImageCategory('flora')).toBe('botany');
      expect(getWildlifeImageCategory('botany')).toBe('botany');
      expect(getWildlifeImageCategory('insects')).toBe('wildlife');
      expect(getWildlifeImageCategory('fauna')).toBe('wildlife');
      expect(getWildlifeImageCategory('wildlife')).toBe('wildlife');
      expect(getWildlifeImageCategory('aquatic')).toBe('aquatic');
      expect(getWildlifeImageCategory('tracking')).toBe('tracking');
      expect(getWildlifeImageCategory('unknown_fallback')).toBe('wildlife');
    });
  });

  describe('buildWildlifeImageSrc', () => {
    it('should build paths correctly', () => {
      // absolute and root-relative URLs remain unchanged
      expect(buildWildlifeImageSrc({ image: 'https://example.com/pic.jpg' })).toBe('https://example.com/pic.jpg');
      expect(buildWildlifeImageSrc({ image: '/absolute/path/pic.jpg' })).toBe('/absolute/path/pic.jpg');

      // collection maps
      expect(buildWildlifeImageSrc({ image: 'strawberry.jpg', collection: 'flora' })).toBe('/images/botany/strawberry.jpg');
      expect(buildWildlifeImageSrc({ image: 'ant.jpg', collection: 'insects' })).toBe('/images/wildlife/ant.jpg');
      expect(buildWildlifeImageSrc({ image: 'bear.jpg', collection: 'fauna' })).toBe('/images/wildlife/bear.jpg');
      expect(buildWildlifeImageSrc({ image: 'bass.jpg', collection: 'aquatic' })).toBe('/images/aquatic/bass.jpg');
      expect(buildWildlifeImageSrc({ image: 'deer_track.jpg', collection: 'tracking' })).toBe('/images/tracking/deer_track.jpg');
    });
  });
});
