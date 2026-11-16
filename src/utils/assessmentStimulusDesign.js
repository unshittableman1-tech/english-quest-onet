// Presentation only. This module must never manufacture assessment wording.
export const stimulusTokens = Object.freeze({
  ink: '#183e53', paper: '#ffffff', ocean: '#175b78', forest: '#28624f',
  violet: '#694689', gold: '#b68a32',
});

export function stimulusDesign(art) {
  const words = [art.title, ...(art.lines || [])].join(' ');
  if (art.kind === 'process') return { family: 'process', tone: 'forest', pictogram: null };
  if (['table', 'bars', 'pie', 'chartChoices'].includes(art.kind)) return { family: 'chart', tone: 'ocean', pictogram: null };
  if (art.kind === 'scene') return { family: 'context', tone: 'ocean', pictogram: null };
  const pictogram = /Photography/.test(words) ? 'camera' : /Pedestrians/.test(words) ? 'pedestrian'
    : /stairs/.test(words) ? 'stairs' : /Quiet|quiet|softly/.test(words) ? 'quiet' : null;
  if (art.kind === 'sign') return { family: 'sign', tone: 'ocean', pictogram };
  if (/You are invited|Reading celebration|Lantern night/.test(art.title)) return { family: 'invitation', tone: 'violet', pictogram: null };
  if (/Planting soil/.test(art.title)) return { family: 'label', tone: 'forest', pictogram: 'leaf' };
  if (/Mountain camp/.test(art.title)) return { family: 'weather', tone: 'ocean', pictogram: 'snow' };
  if (/penguin|otter|Diwali|Tanabata|Breakfast/.test(art.title)) return { family: 'information', tone: 'forest', pictogram: null };
  return { family: 'notice', tone: 'ocean', pictogram };
}

export const hasDocumentPresentation = art => {
  if (!art || typeof art.title !== 'string') return false;
  const lines = art.kind === 'process' ? art.steps : art.lines;
  return ['sign', 'notice', 'card', 'process'].includes(art.kind)
    && Array.isArray(lines) && lines.length > 0 && lines.every(line => typeof line === 'string');
};

// The role of the evidence decides the projection, never a legacy asset name
// or a generic "2.5D" label. Measured/compared information always stays flat.
export function assessmentVisualTreatment(art) {
  if (!art) return 'unspecified';
  return art.kind === 'scene' ? 'context-2.5d' : 'evidence-2d';
}
