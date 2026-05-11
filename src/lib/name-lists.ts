// Curated public-domain name lists for the Name Generator tool.
// All names are from open/historical sources or are fictional.

export interface NameCategory {
  label: string;
  first: string[];
  last: string[];
  places: string[];
}

export const NAME_CATEGORIES: Record<string, NameCategory> = {
  fantasy: {
    label: 'Fantasy',
    first: [
      'Aelindra', 'Boran', 'Caelum', 'Dryssa', 'Elowen', 'Faelith', 'Gareth', 'Helwyn',
      'Idris', 'Jorah', 'Kaelith', 'Lyris', 'Maevar', 'Nythara', 'Oryn', 'Perdis',
      'Quillon', 'Reva', 'Seldor', 'Thera', 'Ulvaine', 'Vaelith', 'Wren', 'Xaedra',
      'Yriel', 'Zaephon', 'Auren', 'Blysse', 'Caldric', 'Davan',
    ],
    last: [
      'Ashvale', 'Blackthorn', 'Coldmere', 'Dawnwood', 'Emberveil', 'Frosthollow',
      'Grimstone', 'Hollowbrook', 'Ironwatch', 'Jadenveil', 'Kindlefire', 'Longthorn',
      'Moonshadow', 'Nighthollow', 'Oakhaven', 'Pyrewatch', 'Quicksilver', 'Ravenwood',
      'Stormwatch', 'Thornwall', 'Underhill', 'Veilmere', 'Whitecrest', 'Yarrow',
    ],
    places: [
      'Aethermere', 'Brighthollow', 'Cinderfall', 'Duskwatch', 'Embercross',
      'Frostveil', 'Goldenmere', 'Highwatch', 'Ironton', 'Jadehollow',
      'Kinderfall', 'Longveil', 'Moonwatch', 'Nightcross', 'Oakshadow',
      'Peakfall', 'Quickthorn', 'Rimestone', 'Silvercross', 'Thornkeep',
    ],
  },

  medieval: {
    label: 'Medieval / Historical',
    first: [
      'Aldric', 'Beatrix', 'Conrad', 'Dorothea', 'Edmund', 'Felicia', 'Godfrey',
      'Hildegard', 'Ingram', 'Joanna', 'Kenric', 'Liselotte', 'Maud', 'Nigel',
      'Oswin', 'Petronilla', 'Quentin', 'Rohesia', 'Sigrid', 'Thomasina',
      'Ulric', 'Viola', 'Wulfric', 'Ximena', 'Ysabel', 'Zacharias',
      'Aelfric', 'Bertram', 'Cecily', 'Dunstan',
    ],
    last: [
      'Blackwood', 'Coppersmith', 'Dunmore', 'Edgecroft', 'Fletcher',
      'Greymantle', 'Hawksworth', 'Ironside', 'Jenner', 'Kettleworth',
      'Locksley', 'Millward', 'Northgate', 'Oldham', 'Pennington',
      'Quellar', 'Redstone', 'Silverbridge', 'Tanner', 'Underwood',
      'Villiers', 'Wakefield', 'Yarborough',
    ],
    places: [
      'Ashford', 'Bridgemark', 'Castlegate', 'Dunwall', 'Elderwick',
      'Fenwick', 'Greymoor', 'Harrowgate', 'Ironford', 'Kettlebridge',
      'Longwall', 'Moorside', 'Northholm', 'Oakhurst', 'Pinesward',
      'Redmarsh', 'Stonegate', 'Thornwall', 'Upthorpe', 'Westmore',
    ],
  },

  norse: {
    label: 'Norse / Viking',
    first: [
      'Åsa', 'Bjørn', 'Dagny', 'Eirik', 'Freydís', 'Gunnar', 'Helga', 'Ingvar',
      'Jórunn', 'Knut', 'Lifa', 'Magnus', 'Nanna', 'Ólaf', 'Ragna',
      'Sigurd', 'Thora', 'Ulf', 'Valdís', 'Vigdís', 'Yngvar', 'Ásta',
      'Bersi', 'Dalla', 'Egil', 'Floki', 'Gerd', 'Hákon', 'Ivar',
    ],
    last: [
      'Axebearer', 'Bjørnson', 'Coldblood', 'Deepwater', 'Erikson',
      'Frostborn', 'Greycloak', 'Hammerfall', 'Ironbark', 'Jarlson',
      'Kettilsson', 'Longship', 'Magnusson', 'Nightborn', 'Odinsson',
      'Ragnvaldsson', 'Seafarer', 'Thornvald', 'Ulvsson', 'Whitespear',
    ],
    places: [
      'Askgard', 'Bjørnheim', 'Coldfjord', 'Dragonskeep', 'Elmswatch',
      'Frostholm', 'Greywater', 'Hammerbay', 'Ironcliff', 'Jarlsvik',
      'Kettilmark', 'Longfjord', 'Moorkeld', 'Nightcliff', 'Olafstead',
      'Ragnarvik', 'Stormcliff', 'Thornhaven', 'Ulfmark', 'Whitefjord',
    ],
  },

  portuguese: {
    label: 'Portuguese / Brazilian',
    first: [
      'Ana', 'Bruno', 'Carla', 'Diego', 'Elisa', 'Felipe', 'Gabriela', 'Henrique',
      'Isabela', 'João', 'Karina', 'Lucas', 'Maria', 'Nathália', 'Otávio',
      'Patrícia', 'Rafael', 'Sílvia', 'Thiago', 'Úrsula', 'Vanessa', 'Wagner',
      'Beatriz', 'Caio', 'Daniela', 'Eduardo', 'Fernanda', 'Gustavo', 'Helena',
    ],
    last: [
      'Alves', 'Barbosa', 'Carvalho', 'Costa', 'Dias', 'Ferreira', 'Gomes',
      'Lima', 'Martins', 'Nunes', 'Oliveira', 'Pereira', 'Rodrigues',
      'Santos', 'Silva', 'Sousa', 'Tavares', 'Vieira', 'Xavier', 'Zanetti',
    ],
    places: [
      'Aldeia Nova', 'Brejo Fundo', 'Cachoeirinha', 'Dos Pinheiros', 'Estrela d\'Alva',
      'Flor do Cerrado', 'Gruta da Lua', 'Horizonte Claro', 'Ilhéus do Norte',
      'Jardim das Pedras', 'Lagoa Serena', 'Monte Branco', 'Nova Esperança',
      'Olhos d\'Água', 'Pedra Azul', 'Queimadas', 'Rio das Pedras', 'Serra Alta',
      'Terras do Sul', 'Várzea Grande',
    ],
  },

  scifi: {
    label: 'Sci-Fi',
    first: [
      'Arix', 'Bex', 'Corvyn', 'Dex', 'Echo', 'Flux', 'Grale', 'Hex',
      'Ion', 'Jax', 'Kael', 'Lyra', 'Mira', 'Nyx', 'Orb', 'Pax',
      'Quasar', 'Rho', 'Stryx', 'Tau', 'Unit', 'Vex', 'Wren', 'Xel',
      'Yule', 'Zephyr', 'Arc', 'Bit', 'Core', 'Data',
    ],
    last: [
      'Crestfall', 'Deepvoid', 'Evenstar', 'Farreach', 'Gridlock',
      'Highspin', 'Ironcore', 'Jumpgate', 'Kinetica', 'Lightfall',
      'Massdrive', 'Nullpoint', 'Orbitfall', 'Praxis', 'Quantum',
      'Riftwatch', 'Sunfall', 'Terminus', 'Ultranova', 'Voidwatch',
    ],
    places: [
      'Alpha Station', 'Bright Horizon', 'Coldreach', 'Darkside Base', 'Echo Sector',
      'Farpoint', 'Gateway Prime', 'Highfall', 'Ion Drift', 'Junction Four',
      'Kilo Station', 'Light Horizon', 'Midvoid', 'Null Reach', 'Orbit Seven',
      'Prism Gate', 'Rift Landing', 'Solar Drift', 'Terminus', 'Void Station',
    ],
  },
};

export type NameCategoryKey = keyof typeof NAME_CATEGORIES;

export const CATEGORY_KEYS = Object.keys(NAME_CATEGORIES) as NameCategoryKey[];

// Simple LCG seeded random (same seed = same sequence, avoids Math.random)
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function generateName(
  categoryKey: NameCategoryKey,
  type: 'first' | 'last' | 'place' | 'full',
  seed?: number
): string {
  const cat = NAME_CATEGORIES[categoryKey];
  if (!cat) return '';
  const rng = seededRandom(seed ?? Date.now());

  const pick = (arr: string[]) => arr[Math.floor(rng() * arr.length)];

  if (type === 'first')  return pick(cat.first);
  if (type === 'last')   return pick(cat.last);
  if (type === 'place')  return pick(cat.places);
  return `${pick(cat.first)} ${pick(cat.last)}`;
}
