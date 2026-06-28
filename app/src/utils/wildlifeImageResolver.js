export const WILDLIFE_COLLECTION_IMAGE_CATEGORIES = {
  flora: 'botany',
  insects: 'wildlife',
  fauna: 'wildlife',
  aquatic: 'aquatic',
  tracking: 'tracking'
};

export const sanitizeWildlifeImages = (images) => {
  if (!images || !Array.isArray(images)) return [];
  const cleaned = images
    .map(img => typeof img === 'string' ? img.trim() : '')
    .filter(img => {
      if (!img) return false;
      const lower = img.toLowerCase();
      return !['placeholder', 'no-image', 'missing', 'null', 'undefined'].some(term => lower.includes(term));
    });
  return [...new Set(cleaned)];
};

// eslint-disable-next-line no-unused-vars
export const getWildlifeImageCategory = (collectionOrCategory, item = null) => {
  if (!collectionOrCategory) return 'wildlife';
  const val = collectionOrCategory.toLowerCase();
  if (val === 'flora' || val === 'botany') return 'botany';
  if (val === 'insects' || val === 'fauna' || val === 'wildlife') return 'wildlife';
  if (val === 'aquatic') return 'aquatic';
  if (val === 'tracking') return 'tracking';
  return 'wildlife';
};

export const buildWildlifeImageSrc = ({ image, collection, category, item }) => {
  if (!image || typeof image !== 'string') return '';
  if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/')) {
    return image;
  }
  const resolvedCategory = getWildlifeImageCategory(collection || category, item);
  return `/images/${resolvedCategory}/${image}`;
};
