// Writing prompt generator — no AI, no network calls.
// Uses curated genre/style-aware templates with seeded randomization.

interface SlotPool {
  settings: string[];
  characters: string[];
  conflicts: string[];
  discoveries: string[];
  secrets: string[];
  objects: string[];
  timespan: string[];
  consequences: string[];
}

const GENRE_DATA: Record<string, SlotPool> = {
  fantasy: {
    settings: [
      'a forgotten kingdom', 'an enchanted forest', 'a city built on clouds',
      'the ruins of an ancient empire', 'a mountain pass between realms',
      'a floating island above the sea of mist', 'a library that exists outside of time',
      'the last city protected by a crumbling ward',
    ],
    characters: [
      'a reluctant heir', 'an exiled mage', 'a wandering knight without a lord',
      'a young scholar who knows too much', 'a disgraced noble seeking redemption',
      'a thief who can steal memories', 'a cartographer who maps places that don\'t exist',
    ],
    conflicts: [
      'an ancient prophecy finally stirs', 'a cursed artefact has resurfaced',
      'two kingdoms stand on the brink of war', 'a portal to another realm has opened',
      'the magic that holds their world together is failing', 'a god returns — and they are furious',
    ],
    discoveries: [
      'a map to a place that shouldn\'t exist', 'a forbidden spell with no known counter',
      'a bloodline long thought extinct', 'proof that the gods are lying',
      'a door that opens only at midnight', 'a language older than civilisation',
    ],
    secrets: [
      'their true parentage', 'the location of a sealed weapon', 'a betrayal from centuries ago',
      'the real reason the last war ended', 'what lives beneath the holy city',
    ],
    objects: [
      'a cursed blade', 'an enchanted tome', 'a stolen crown',
      'a compass that points to what you fear most', 'a mirror that shows the past',
    ],
    timespan: ['seven years', 'a decade', 'half their life', 'three long centuries'],
    consequences: [
      'the erasure of an entire people', 'the return of a dark age',
      'losing everyone they love', 'becoming the very thing they fought',
    ],
  },

  'sci-fi': {
    settings: [
      'a generation ship three hundred years from home', 'a colony on a dying planet',
      'a space station at the edge of explored space', 'a city buried under a moon\'s ice shelf',
      'the last functioning terraforming rig in the system',
      'a research vessel inside a black hole\'s accretion disc',
    ],
    characters: [
      'a ship engineer who discovers the crew are not what they seem',
      'a xenobiologist on first contact', 'an AI that has decided to feel',
      'a clone who meets their original', 'a time-loop pilot stuck in a battle they can\'t win',
      'a diplomat whose translator is hiding things',
    ],
    conflicts: [
      'first contact goes catastrophically wrong', 'an alien signal turns out to be a warning',
      'the corporation that owns the ship has new orders', 'a faster-than-light jump leaves them somewhere impossible',
      'the AI core has made a decision the crew can\'t override',
    ],
    discoveries: [
      'a derelict vessel with no crew and a running log', 'evidence of a civilisation that erased itself',
      'a stasis pod containing someone who shouldn\'t be there',
      'a signal that has been transmitting for ten thousand years',
    ],
    secrets: [
      'the true purpose of the mission', 'what happened to the previous crew',
      'why the corporation is really funding the expedition', 'what the AI has been hiding',
    ],
    objects: [
      'a data core encrypted in an unknown language', 'a bioweapon in a sealed chamber',
      'an artefact that predates humanity', 'a navigation chart to uncharted space',
    ],
    timespan: ['six months in stasis', 'two years in deep space', 'a decade of isolation'],
    consequences: [
      'the extinction of one species — or another', 'the end of humanity\'s expansion era',
      'rewriting the history of the universe', 'being stranded with no way back',
    ],
  },

  mystery: {
    settings: [
      'a snowbound manor in the mountains', 'a locked-room on a transatlantic liner',
      'a small coastal town where everyone knows each other',
      'an exclusive private club with very old secrets',
      'a crumbling estate with sealed wings',
    ],
    characters: [
      'a retired inspector drawn back in', 'a journalist who stumbles on the wrong story',
      'an outsider inheriting a house full of locked doors',
      'a librarian who notices a pattern in the obituaries',
      'a solicitor who knows more than they let on',
    ],
    conflicts: [
      'a death ruled accidental that clearly wasn\'t', 'a witness who recants their testimony overnight',
      'a will that names someone everyone thought was dead',
      'an artefact goes missing the night of the murder',
    ],
    discoveries: [
      'a second body no one reported missing', 'a diary with pages torn out',
      'a confession letter with the wrong name', 'a motive that implicates the wrong person',
      'a clue hidden in plain sight for years',
    ],
    secrets: [
      'an affair that changes everything', 'an identity assumed decades ago',
      'a debt that was never repaid', 'evidence of a crime the victim committed',
    ],
    objects: [
      'a monogrammed handkerchief at the scene', 'a clock stopped at the exact wrong time',
      'a coded letter with no clear sender', 'a photograph that shouldn\'t exist',
    ],
    timespan: ['twenty years', 'a decade of silence', 'three generations'],
    consequences: [
      'the exposure of a beloved institution', 'the ruin of an innocent family',
      'unpicking a lie the whole town chose to believe',
    ],
  },

  thriller: {
    settings: [
      'a government safe house that\'s been compromised', 'a city during a state of emergency',
      'a foreign embassy 48 hours before a coup',
      'a hospital wing under unofficial lockdown', 'an international airport at 2 a.m.',
    ],
    characters: [
      'an analyst who realises the threat is inside the agency',
      'a hostage negotiator facing their worst case',
      'a disavowed operative with one last job',
      'a bystander who saw the wrong thing at the wrong moment',
      'an attorney who receives a classified file by mistake',
    ],
    conflicts: [
      'an asset has gone dark and only one person knows why',
      'a countdown has started that only the protagonist can stop',
      'a double-cross leaves them with no allies they can trust',
      'the attack they were warned about just happened — but it\'s a decoy',
    ],
    discoveries: [
      'the target of the plot is someone close to them',
      'the intelligence they were given was fabricated',
      'the person they\'ve been tracking has been dead for months',
      'there is a second operation running in parallel',
    ],
    secrets: [
      'who authorised the original mission', 'what the agency is really protecting',
      'whose side their handler is on', 'why the target chose not to run',
    ],
    objects: [
      'an encrypted drive that everyone is willing to kill for',
      'a burner phone with one number saved', 'a forged identity that leads somewhere real',
    ],
    timespan: ['seventy-two hours', 'four days', 'a single night'],
    consequences: [
      'the collapse of a fragile peace treaty', 'the exposure of an entire spy network',
      'the assassination of the wrong person', 'a war that could have been prevented',
    ],
  },

  horror: {
    settings: [
      'an isolated research station in winter', 'a childhood home that feels different now',
      'a rural town where the locals ask no questions',
      'a basement archive full of things that shouldn\'t have been catalogued',
      'a hospital that was decommissioned for reasons nobody will say',
    ],
    characters: [
      'a caretaker who starts hearing their predecessor\'s voice',
      'a folklorist who takes the stories too seriously',
      'a survivor of something that didn\'t leave marks',
      'a family who moved in hoping for a fresh start',
      'someone returning home after years away, finding it changed',
    ],
    conflicts: [
      'something that was sealed has been opened', 'a pattern in the disappearances becomes undeniable',
      'the dreams have started to bleed into waking hours',
      'the thing they saw cannot be explained — and it saw them too',
    ],
    discoveries: [
      'an old journal that ends in the middle of a sentence',
      'photographs of people who were never here',
      'evidence that this has happened before, many times',
      'a room that isn\'t on any floor plan',
    ],
    secrets: [
      'what the founding family agreed to', 'what really lives in the lower levels',
      'why everyone who investigates stops asking questions',
    ],
    objects: [
      'a door that should not open but does', 'a recording with sounds they can\'t identify',
      'a child\'s drawing that is far too accurate', 'a mirror that is always slightly behind',
    ],
    timespan: ['one sleepless night', 'a long winter', 'the first week after moving in'],
    consequences: [
      'becoming part of the thing they fear', 'watching everyone else be taken first',
      'a truth that cannot be survived', 'a cycle that has no exit',
    ],
  },

  romance: {
    settings: [
      'a small bookshop during a rainstorm', 'a weekend retreat neither of them wanted to attend',
      'the last two seats on an overnight train', 'a city neither of them calls home',
      'a family wedding where they\'re seated together by mistake',
    ],
    characters: [
      'two rivals assigned to the same project', 'old friends meeting again after years apart',
      'a sworn introvert and the most gregarious person at the party',
      'two people who wrote letters and never met',
      'someone determined to stay unattached and someone equally determined',
    ],
    conflicts: [
      'a secret that one of them is keeping threatens everything',
      'their lives are about to take them in opposite directions',
      'they\'ve been pretending to be a couple for a reason that no longer feels fake',
      'their families have a history that complicates everything',
    ],
    discoveries: [
      'that the person they\'ve been avoiding is the person they needed',
      'that the timing was never wrong — only the courage was',
      'a letter that was never sent, found years too late',
    ],
    secrets: [
      'why they left the first time', 'what they are afraid to want',
      'the one thing they\'ve never told anyone',
    ],
    objects: [
      'a returned book with a note inside', 'a playlist someone made and never explained',
      'a photograph from a moment neither of them talked about',
    ],
    timespan: ['one week', 'a single summer', 'ten years of almost'],
    consequences: [
      'losing the friendship they built first', 'admitting what they have always known',
      'choosing a life they had ruled out',
    ],
  },

  adventure: {
    settings: [
      'an uncharted island chain', 'a mountain range that doesn\'t appear on maps',
      'a river that flows uphill for the last mile',
      'the ruins of a port city swallowed by the jungle',
      'a desert crossing with one source of water that may have dried up',
    ],
    characters: [
      'a disgraced cartographer on one last expedition',
      'a hired guide who knows more than they admit',
      'a young stowaway who turns out to be essential',
      'a seasoned explorer and their inexperienced apprentice',
      'rivals racing toward the same destination',
    ],
    conflicts: [
      'the route is more dangerous than the maps suggest',
      'a rival expedition is one day ahead',
      'the supplies they were promised aren\'t there',
      'one of the group has a reason not to reach the destination',
    ],
    discoveries: [
      'evidence of a civilisation no history book mentions',
      'a structure that should not be possible to build',
      'a native guardian who has been waiting for them specifically',
      'a resource that will change the world — if they can get it home',
    ],
    secrets: [
      'who commissioned the expedition and why',
      'what happened to the last team', 'the real nature of what they\'re looking for',
    ],
    objects: [
      'a compass that points to something other than north',
      'a partial map with one crucial piece missing',
      'an artefact pulled from the earth that shouldn\'t be there',
    ],
    timespan: ['three weeks of travel', 'a six-month expedition', 'forty days with dwindling supplies'],
    consequences: [
      'a discovery that changes the map', 'returning without everyone who set out',
      'bringing something home that should have stayed lost',
    ],
  },

  historical: {
    settings: [
      'a port city at the height of the trade routes', 'a court in the middle of a succession crisis',
      'a battlefield the morning after', 'a city under siege',
      'a monastery with a library worth more than a kingdom',
    ],
    characters: [
      'a scribe who reads documents meant for no one\'s eyes',
      'a foreign ambassador navigating an unfamiliar court',
      'a merchant whose shipment hides something else',
      'a healer caught between two warring factions',
      'a soldier who survived when they weren\'t meant to',
    ],
    conflicts: [
      'two powers meet at the edge of war',
      'a discovery threatens the authority of an established institution',
      'a treaty has been signed, but not everyone agrees to it',
      'the succession is disputed and blood will be spilled over it',
    ],
    discoveries: [
      'a document that contradicts official history',
      'evidence of a heresy or conspiracy that goes to the highest level',
      'a meeting between enemies that was never supposed to be known',
    ],
    secrets: [
      'who ordered the assassination', 'which side the spy was really working for',
      'what the monastery\'s library actually contains',
    ],
    objects: [
      'a seal that grants access to forbidden archives',
      'a letter in a code no one living should know',
      'a relic whose authenticity rewrites everything',
    ],
    timespan: ['three turbulent years', 'a decade of peace before the storm', 'one decisive month'],
    consequences: [
      'the fall of a dynasty', 'the suppression of a truth that resurfaces centuries later',
      'a nation remade from its ruins',
    ],
  },

  literary: {
    settings: [
      'a family home at the end of summer', 'a dying town with one road in and out',
      'a city neighbourhood over a single decade',
      'a university where old rivalries never resolved',
      'an ordinary day that is not ordinary at all',
    ],
    characters: [
      'someone returning to a place they swore they\'d left behind',
      'two siblings sorting through what their parents left',
      'a person at the exact midpoint between two lives',
      'someone who has chosen the safer path and wonders',
      'a narrator who is not sure they are reliable',
    ],
    conflicts: [
      'an inheritance forces a family to reckon with what they avoid',
      'a chance meeting opens a door that was deliberately closed',
      'the version of themselves they show the world has stopped working',
      'time is doing something to the relationships they counted on',
    ],
    discoveries: [
      'a truth about a parent they thought they knew',
      'that the life they left behind still exists — just without them',
      'that forgiveness is more complicated than they wanted it to be',
    ],
    secrets: [
      'the reason the family stopped talking', 'what they gave up to get here',
      'how different their life looks from the outside',
    ],
    objects: [
      'a box of letters in handwriting they recognise',
      'an old photograph with a stranger in it',
      'a returned possession that carries too much weight',
    ],
    timespan: ['a single afternoon', 'one long summer', 'the last year of something'],
    consequences: [
      'understanding something too late to change it',
      'choosing what to carry forward and what to put down',
      'finding the words for what they have never said',
    ],
  },

  drama: {
    settings: [
      'a family gathering that goes sideways', 'a workplace on the day of an important decision',
      'a hospital waiting room', 'an apartment shared for too long',
      'a hometown visited after years away',
    ],
    characters: [
      'two people who were once close and are now strangers',
      'a parent and child who have run out of safe topics',
      'colleagues on the day that changes everything',
      'someone trying to hold together something already broken',
      'an outsider who sees what everyone else has stopped noticing',
    ],
    conflicts: [
      'a decision must be made that not everyone agrees with',
      'something long unspoken finally comes out',
      'a crisis forces the group to act together despite everything between them',
      'the arrival of someone changes the dynamics irrevocably',
    ],
    discoveries: [
      'that the person they blamed did not deserve it',
      'that what they wanted and what they needed are not the same',
      'a truth about the past that reframes the present',
    ],
    secrets: [
      'a lie told so long ago it became fact', 'a decision made on someone else\'s behalf',
      'what they\'ve been hiding about why they stayed',
    ],
    objects: [
      'a letter that arrives at the worst possible moment',
      'an object passed down that means different things to everyone',
    ],
    timespan: ['one long day', 'a difficult week', 'the hours before a departure'],
    consequences: [
      'saying something that cannot be unsaid', 'a relationship changed beyond what either expected',
      'something finally, quietly, resolving',
    ],
  },

  comedy: {
    settings: [
      'a local festival that has gone spectacularly wrong',
      'a job interview for a position nobody wants',
      'a destination wedding with three different transport disasters',
      'a shared flat with four people who should not be sharing',
      'a bureaucratic process that has taken on a life of its own',
    ],
    characters: [
      'an overly prepared person in an entirely unprepared situation',
      'two people with the same goal and entirely opposite approaches',
      'someone who keeps making the situation worse while trying to help',
      'an expert who turns out to be an expert in the wrong thing',
    ],
    conflicts: [
      'a plan that was foolproof until it met the fools',
      'a misunderstanding that compounds every time someone tries to fix it',
      'the one thing they needed turns out to be the one thing unavailable',
      'an attempt to keep a secret creates three more secrets',
    ],
    discoveries: [
      'that the solution was embarrassingly obvious', 'that they\'ve been arguing with the wrong person',
      'that the disaster actually worked out better than the plan',
    ],
    secrets: [
      'what they were really trying to avoid', 'the part of the story they left out',
    ],
    objects: [
      'a mislabelled parcel that keeps changing hands',
      'a key that fits the wrong lock — or possibly several wrong locks',
      'a document that needs one signature from someone who cannot be found',
    ],
    timespan: ['one increasingly eventful afternoon', 'a weekend that gets away from them', 'a 24-hour period'],
    consequences: [
      'an outcome nobody planned but everyone needed',
      'a friendship forged in mutual mortification',
      'a story they will be telling for years, against their will',
    ],
  },
};

// Hook templates — {slot} is replaced at runtime.
// Slots: {setting}, {character}, {conflict}, {discovery}, {secret}, {object}, {timespan}, {consequence}
const HOOKS = [
  "While navigating {conflict}, {character} uncovers {discovery} in {setting} — and realises their world may never be the same.",
  "{Character} has spent {timespan} hiding {secret}. Tonight, {conflict}, and the past refuses to stay buried.",
  "In {setting}, when {conflict}, only {character} possesses what's needed to act — but doing so means risking {consequence}.",
  "{Character} finds {object} in {setting}. It shouldn't be there. Understanding why leads them straight into {conflict}.",
  "A stranger arrives in {setting} carrying {discovery}. {Character} is the only one who understands what it means — and what it will cost.",
  "After {timespan}, {character} returns to {setting} for one reason. They find {discovery} instead — and {conflict} waiting with it.",
  "{Character} makes a choice that cannot be undone. Set against {setting}, the story begins the moment {conflict}.",
  "Everyone in {setting} believes {secret}. {Character} is about to prove them wrong — if {conflict} doesn't stop them first.",
  "The {object} has been missing for {timespan}. When {character} finally finds it in {setting}, it reveals {discovery}.",
  "{Character} was never supposed to be in {setting}. But {conflict}, and now leaving is no longer simple.",
  "The last time {character} was in {setting}, everything was different. Now {conflict} — and {discovery} changes the stakes entirely.",
  "When {conflict} forces {character} into {setting}, they carry only one advantage: knowledge of {secret}.",
  "{Character} agrees to one thing. Then {discovery}. Then {conflict}. By the time they understand what they're really facing, turning back would mean {consequence}.",
  "In {setting}, {character} and an unexpected ally must navigate {conflict}. The cost of failure is {consequence}. The cost of trust may be higher.",
  "For {timespan}, {character} avoided {setting}. A single night back — and {conflict} — makes avoidance impossible.",
  "{Object} found in {setting} opens a question {character} should have asked {timespan} ago. The answer involves {discovery} — and {conflict}.",
  "They said {secret} was impossible. {Character} has proof otherwise — and {conflict} that will determine who finds out first.",
  "{Character} was looking for something ordinary in {setting}. They found {discovery}. Now {conflict} is their problem.",
];

// ---------- randomisation ----------

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function normaliseGenre(genre: string): string {
  const g = genre.toLowerCase().trim();
  const aliases: Record<string, string> = {
    'sci fi': 'sci-fi',
    'science fiction': 'sci-fi',
    'scifi': 'sci-fi',
    'sf': 'sci-fi',
    'spec fic': 'sci-fi',
    'speculative': 'sci-fi',
    'hist fic': 'historical',
    'historical fiction': 'historical',
    'literary fiction': 'literary',
    'crime': 'mystery',
    'detective': 'mystery',
    'whodunit': 'mystery',
    'noir': 'thriller',
    'suspense': 'thriller',
    'cozy': 'mystery',
    'paranormal': 'horror',
    'gothic': 'horror',
    'supernatural': 'horror',
    'action': 'adventure',
    'action adventure': 'adventure',
    'humour': 'comedy',
    'humor': 'comedy',
    'satire': 'comedy',
    'slice of life': 'drama',
    'contemporary': 'literary',
    'general fiction': 'literary',
    'fiction': 'literary',
  };
  return aliases[g] ?? g;
}

// ---------- public API ----------

export interface PromptGeneratorInput {
  genre: string;
  style: string;
  notes?: string;
  characterName?: string;
  characterRole?: string;
  documentHint?: string;
}

export function generateWritingPrompt(input: PromptGeneratorInput): string {
  const genreKey = normaliseGenre(input.genre);
  const pool = GENRE_DATA[genreKey] ?? GENRE_DATA['literary'];

  // Use current time as seed for variation on each call
  const rand = seededRandom(Date.now() ^ (input.genre.length * 31));

  const hook = pick(HOOKS, rand);

  const character = input.characterName
    ? `${input.characterName}${input.characterRole ? `, a ${input.characterRole},` : ''}`
    : pick(pool.characters, rand);

  const slots: Record<string, string> = {
    setting: pick(pool.settings, rand),
    character,
    Character: capitalise(character),
    conflict: pick(pool.conflicts, rand),
    discovery: pick(pool.discoveries, rand),
    secret: pick(pool.secrets, rand),
    object: pick(pool.objects, rand),
    timespan: pick(pool.timespan, rand),
    consequence: pick(pool.consequences, rand),
  };

  let prompt = hook.replace(/\{(\w+)\}/g, (_, key) => slots[key] ?? `[${key}]`);

  // Style modifiers
  const style = input.style.toLowerCase();
  if (style.includes('dark') || style.includes('grit')) {
    prompt += ' The tone is bleak and unsparing.';
  } else if (style.includes('humor') || style.includes('humour') || style.includes('comic') || style.includes('funny')) {
    prompt += ' Play it with dry wit and an eye for absurdity.';
  } else if (style.includes('poetic') || style.includes('lyrical')) {
    prompt += ' Lean into imagery and the rhythm of the language.';
  } else if (style.includes('whimsical') || style.includes('playful')) {
    prompt += ' Keep the tone light and full of wonder.';
  } else if (style.includes('fast') || style.includes('action')) {
    prompt += ' Keep sentences short; prioritise momentum over atmosphere.';
  } else if (style.includes('introspective') || style.includes('contemplative')) {
    prompt += ' Let the character\'s inner life be the real story.';
  } else if (style.includes('atmospheric') || style.includes('gothic')) {
    prompt += ' Build the mood slowly — setting is almost a character.';
  } else if (style.includes('heartwarming') || style.includes('uplifting')) {
    prompt += ' End on something earned and hopeful.';
  }

  // Notes
  if (input.notes?.trim()) {
    prompt += ` Additional context: ${input.notes.trim()}`;
  }

  // Document context
  if (input.documentHint?.trim()) {
    const hint = input.documentHint.trim().slice(0, 200);
    prompt += ` Draw from the themes and setting of this excerpt: "${hint}…"`;
  }

  return prompt;
}
