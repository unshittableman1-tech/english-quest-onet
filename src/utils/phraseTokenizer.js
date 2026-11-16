/**
 * Pure helper functions for multi-word phrase matching and tokenization.
 */

export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Tokenizes text by first identifying multi-word phrases from known dictionary keys,
 * then segmenting remaining parts into individual word tokens.
 */
export function tokenizeTextWithPhrases(text, phraseKeys) {
  let segments = [{ text, isPhrase: false, phraseKey: null }];

  for (const phrase of phraseKeys) {
    const next = [];
    const escaped = escapeRegExp(phrase);
    const regex = new RegExp('(^|[^a-zA-Z0-9_-])(' + escaped + ')(?![a-zA-Z0-9_-])', 'gi');
    
    for (const seg of segments) {
      if (seg.isPhrase) {
        next.push(seg);
        continue;
      }
      let lastIdx = 0;
      seg.text.replace(regex, (match, prefix, matchPhrase, offset) => {
        const matchStart = offset + prefix.length;
        if (matchStart > lastIdx) {
          next.push({ text: seg.text.slice(lastIdx, matchStart), isPhrase: false });
        }
        next.push({ text: matchPhrase, isPhrase: true, phraseKey: phrase });
        lastIdx = matchStart + matchPhrase.length;
      });
      if (lastIdx < seg.text.length) {
        next.push({ text: seg.text.slice(lastIdx), isPhrase: false });
      }
    }
    segments = next;
  }

  return segments;
}
