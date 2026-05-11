// Bundled list of common English (and some Portuguese) clichés.
// All lowercase, no punctuation — matched case-insensitively on word boundaries.

export const CLICHES: string[] = [
  // Time / endings
  'at the end of the day', 'when all is said and done', 'at this point in time',
  'in the nick of time', 'stood the test of time', 'time will tell', 'only time will tell',
  'time flies', 'against the clock', 'time heals all wounds',

  // Overused openers / transitions
  'needless to say', 'it goes without saying', 'last but not least',
  'in conclusion', 'to cut a long story short', 'without further ado',
  'all things considered', 'at the end of the day', 'truth be told',

  // Action / effort
  'think outside the box', 'push the envelope', 'raise the bar', 'move the needle',
  'hit the ground running', 'give 110 percent', 'go the extra mile',
  'burning the midnight oil', 'on the same page', 'move the goalposts',
  'touch base', 'circle back', 'low-hanging fruit',

  // Comparison clichés
  'dead as a doornail', 'fit as a fiddle', 'cold as ice', 'hard as nails',
  'light as a feather', 'clear as a bell', 'white as snow', 'dark as night',
  'sharp as a tack', 'blind as a bat', 'cool as a cucumber', 'nutty as a fruitcake',
  'pretty as a picture', 'smart as a whip', 'tough as nails', 'quick as a flash',

  // Body / emotion
  'heart of gold', 'heart of stone', 'wear your heart on your sleeve',
  'skeleton in the closet', 'butterflies in my stomach', 'break a leg',
  'bite the bullet', 'the elephant in the room', 'turning in his grave',

  // Nature / weather
  'every cloud has a silver lining', 'it was a dark and stormy night',
  'calm before the storm', 'under the weather', 'weathered the storm',
  'bolt from the blue', 'read between the lines', 'on thin ice',

  // Common story beats / description
  'silence was deafening', 'blood ran cold', 'heart skipped a beat',
  'time stood still', 'world came crashing down', 'took a deep breath',
  'eyes went wide', 'jaw dropped', 'heart pounded', 'knees went weak',
  'bile rose', 'tears streamed down', 'lump in throat',
  'felt a chill run down',

  // Barking / path / quest
  'barking up the wrong tree', 'on the right track', 'light at the end of the tunnel',
  'the tip of the iceberg', 'a blessing in disguise', 'costs an arm and a leg',
  'hit the nail on the head', 'bite off more than you can chew',
  'best of both worlds', 'missed the boat', 'back to square one',
  'burning bridges', 'got out of hand', 'new lease on life',

  // Portuguese clichés (common in PT-BR fiction)
  'no final das contas', 'de uma vez por todas', 'com o coração na mão',
  'a última carta na manga', 'virando a mesa', 'o silêncio foi ensurdecedor',
];

export function detectCliches(text: string): string[] {
  const lower = text.toLowerCase().replace(/[^\w\s]/g, ' ');
  const found: string[] = [];
  for (const cliche of CLICHES) {
    // Word-boundary-aware: check that it appears as a phrase (not part of a larger word)
    const idx = lower.indexOf(cliche);
    if (idx !== -1) {
      // Reconstruct original casing from source text
      found.push(text.slice(idx, idx + cliche.length));
    }
  }
  return found;
}
