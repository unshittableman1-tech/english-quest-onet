const slugify = (value) => value.toLowerCase().trim().replace(/\s+/g, '-');

const TRANSPORT_WORDS = new Set([
  'ambulance', 'bicycle', 'boat', 'bus', 'car', 'motorcycle',
  'pick-up truck', 'plane', 'ship', 'taxi', 'train', 'van',
]);

const PLACE_WORDS = new Set([
  'airport', 'bank', 'cinema', 'hospital', 'market',
  'post office', 'restaurant', 'school',
]);

export function getVocabularyAsset(word) {
  const normalized = word.toLowerCase().trim();
  const folder = TRANSPORT_WORDS.has(normalized)
    ? 'transport'
    : PLACE_WORDS.has(normalized)
      ? 'places'
      : null;

  return folder ? `/learning/${folder}/${slugify(normalized)}-v1.png` : null;
}

