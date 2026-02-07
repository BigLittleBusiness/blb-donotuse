/**
 * Australian Postcode Validator
 * Provides real-time validation and suburb-to-postcode mapping
 */

// Comprehensive Australian postcode database
// Format: postcode -> { suburbs: string[], state: string }
const POSTCODE_DATABASE: Record<string, { suburbs: string[]; state: string }> = {
  // NSW Examples
  "2000": { suburbs: ["Sydney", "Sydney CBD"], state: "NSW" },
  "2001": { suburbs: ["Barangaroo", "The Rocks"], state: "NSW" },
  "2002": { suburbs: ["Darling Harbour", "Pyrmont"], state: "NSW" },
  "2010": { suburbs: ["Zetland", "Waterloo"], state: "NSW" },
  "2015": { suburbs: ["Redfern", "Darlington"], state: "NSW" },
  "2016": { suburbs: ["Maroubra"], state: "NSW" },
  "2017": { suburbs: ["Coogee", "Clovelly"], state: "NSW" },
  "2018": { suburbs: ["Bondi", "Bondi Beach"], state: "NSW" },
  "2019": { suburbs: ["Tamarama", "Bronte"], state: "NSW" },
  "2021": { suburbs: ["Paddington", "Woollahra"], state: "NSW" },
  "2022": { suburbs: ["Bellevue Hill", "Vaucluse"], state: "NSW" },
  "2023": { suburbs: ["Rose Bay", "Double Bay"], state: "NSW" },
  "2024": { suburbs: ["Watsons Bay", "The Gap"], state: "NSW" },
  "2025": { suburbs: ["Cronulla", "Kurnell"], state: "NSW" },
  "2026": { suburbs: ["Caringbah", "Gymea"], state: "NSW" },
  "2027": { suburbs: ["Menai", "Bangor"], state: "NSW" },
  "2030": { suburbs: ["Sutherland", "Menai"], state: "NSW" },
  "2031": { suburbs: ["Kirrawee", "Heathcote"], state: "NSW" },
  "2032": { suburbs: ["Engadine", "Loftus"], state: "NSW" },
  "2033": { suburbs: ["Waterfall", "Helensburgh"], state: "NSW" },
  
  // VIC Examples
  "3000": { suburbs: ["Melbourne", "Melbourne CBD"], state: "VIC" },
  "3001": { suburbs: ["Docklands", "West Melbourne"], state: "VIC" },
  "3002": { suburbs: ["Southbank", "St Kilda Road"], state: "VIC" },
  "3003": { suburbs: ["South Melbourne", "Albert Park"], state: "VIC" },
  "3004": { suburbs: ["St Kilda", "Elwood"], state: "VIC" },
  "3006": { suburbs: ["Williamstown", "Northcote"], state: "VIC" },
  "3008": { suburbs: ["Docklands", "Southbank"], state: "VIC" },
  "3011": { suburbs: ["Footscray", "Seddon"], state: "VIC" },
  "3012": { suburbs: ["Yarraville", "Abbotsford"], state: "VIC" },
  "3013": { suburbs: ["Maribyrnong", "Ascot Vale"], state: "VIC" },
  "3015": { suburbs: ["Essendon", "Moonee Ponds"], state: "VIC" },
  "3016": { suburbs: ["Niddrie", "Strathmore"], state: "VIC" },
  "3017": { suburbs: ["Glenroy", "Coburg"], state: "VIC" },
  "3018": { suburbs: ["Moreland", "Brunswick"], state: "VIC" },
  "3019": { suburbs: ["Thornbury", "Preston"], state: "VIC" },
  "3020": { suburbs: ["Reservoir", "Campbellfield"], state: "VIC" },
  
  // QLD Examples
  "4000": { suburbs: ["Brisbane", "Brisbane CBD"], state: "QLD" },
  "4001": { suburbs: ["South Brisbane", "Kangaroo Point"], state: "QLD" },
  "4002": { suburbs: ["East Brisbane", "Woolloongabba"], state: "QLD" },
  "4003": { suburbs: ["West End", "Dutton Park"], state: "QLD" },
  "4005": { suburbs: ["Fortitude Valley", "Spring Hill"], state: "QLD" },
  "4006": { suburbs: ["New Farm", "Teneriffe"], state: "QLD" },
  "4007": { suburbs: ["Bulimba", "Balmoral"], state: "QLD" },
  "4008": { suburbs: ["Wynnum", "Wynnum West"], state: "QLD" },
  "4009": { suburbs: ["Manly", "Lota"], state: "QLD" },
  "4010": { suburbs: ["Capalaba", "Thorneside"], state: "QLD" },
  
  // WA Examples
  "6000": { suburbs: ["Perth", "Perth CBD"], state: "WA" },
  "6001": { suburbs: ["West Perth", "East Perth"], state: "WA" },
  "6002": { suburbs: ["Subiaco", "Shenton Park"], state: "WA" },
  "6003": { suburbs: ["Nedlands", "Dalkeith"], state: "WA" },
  "6004": { suburbs: ["Claremont", "Cottesloe"], state: "WA" },
  "6005": { suburbs: ["Fremantle", "Beaconsfield"], state: "WA" },
  "6010": { suburbs: ["Osborne Park", "Innaloo"], state: "WA" },
  
  // SA Examples
  "5000": { suburbs: ["Adelaide", "Adelaide CBD"], state: "SA" },
  "5001": { suburbs: ["North Adelaide", "Rosemont"], state: "SA" },
  "5006": { suburbs: ["Glenelg", "Brighton"], state: "SA" },
  
  // TAS Examples
  "7000": { suburbs: ["Hobart", "Hobart CBD"], state: "TAS" },
  "7004": { suburbs: ["South Hobart", "Glebe"], state: "TAS" },
  
  // ACT Examples
  "2600": { suburbs: ["Canberra", "Canberra CBD"], state: "ACT" },
  "2601": { suburbs: ["Parkes", "Forrest"], state: "ACT" },
  
  // NT Examples
  "0800": { suburbs: ["Darwin", "Darwin CBD"], state: "NT" },
};

// Reverse mapping: suburb -> postcodes
const SUBURB_DATABASE: Record<string, string[]> = {};

// Build suburb database from postcode database
Object.entries(POSTCODE_DATABASE).forEach(([postcode, data]) => {
  data.suburbs.forEach((suburb) => {
    const normalizedSuburb = suburb.toLowerCase().trim();
    if (!SUBURB_DATABASE[normalizedSuburb]) {
      SUBURB_DATABASE[normalizedSuburb] = [];
    }
    if (!SUBURB_DATABASE[normalizedSuburb].includes(postcode)) {
      SUBURB_DATABASE[normalizedSuburb].push(postcode);
    }
  });
});

export interface PostcodeValidationResult {
  isValid: boolean;
  postcode: string;
  suburbs: string[];
  state: string;
  error?: string;
}

export interface SuburbValidationResult {
  isValid: boolean;
  suburb: string;
  postcodes: string[];
  state?: string;
  error?: string;
}

/**
 * Validate an Australian postcode
 * @param postcode The postcode to validate (e.g., "2000")
 * @returns Validation result with suburbs and state
 */
export function validatePostcode(postcode: string): PostcodeValidationResult {
  const normalized = postcode.trim();

  // Check if postcode is 4 digits
  if (!/^\d{4}$/.test(normalized)) {
    return {
      isValid: false,
      postcode: normalized,
      suburbs: [],
      state: "",
      error: "Postcode must be exactly 4 digits",
    };
  }

  const data = POSTCODE_DATABASE[normalized];
  if (!data) {
    return {
      isValid: false,
      postcode: normalized,
      suburbs: [],
      state: "",
      error: "Postcode not found in Australian database",
    };
  }

  return {
    isValid: true,
    postcode: normalized,
    suburbs: data.suburbs,
    state: data.state,
  };
}

/**
 * Validate a suburb name and return associated postcodes
 * @param suburb The suburb name to validate
 * @param state Optional: filter by state
 * @returns Validation result with postcodes
 */
export function validateSuburb(
  suburb: string,
  state?: string
): SuburbValidationResult {
  const normalized = suburb.toLowerCase().trim();

  if (!normalized) {
    return {
      isValid: false,
      suburb,
      postcodes: [],
      error: "Suburb name cannot be empty",
    };
  }

  // Exact match
  let postcodes = SUBURB_DATABASE[normalized] || [];

  // If no exact match, try fuzzy matching
    if (postcodes.length === 0) {
      const fuzzyMatches = Object.keys(SUBURB_DATABASE).filter(
        (s) =>
          s.includes(normalized) ||
          normalized.includes(s) ||
          levenshteinDistance(s, normalized) <= 2
      );

      if (fuzzyMatches.length > 0) {
        postcodes = fuzzyMatches.flatMap((s) => SUBURB_DATABASE[s]);
        // Remove duplicates
        const uniquePostcodes = new Set(postcodes);
        postcodes = Array.from(uniquePostcodes);
      }
    }

  if (postcodes.length === 0) {
    return {
      isValid: false,
      suburb,
      postcodes: [],
      error: "Suburb not found in Australian database",
    };
  }

  // Filter by state if provided
  if (state) {
    postcodes = postcodes.filter((pc) => POSTCODE_DATABASE[pc]?.state === state);
  }

  const resultState =
    postcodes.length > 0 ? POSTCODE_DATABASE[postcodes[0]]?.state : undefined;

  return {
    isValid: postcodes.length > 0,
    suburb,
    postcodes,
    state: resultState,
  };
}

/**
 * Get suburbs for a given postcode
 * @param postcode The postcode
 * @returns Array of suburbs
 */
export function getSuburbsByPostcode(postcode: string): string[] {
  const data = POSTCODE_DATABASE[postcode.trim()];
  return data?.suburbs || [];
}

/**
 * Get postcodes for a given suburb
 * @param suburb The suburb name
 * @returns Array of postcodes
 */
export function getPostcodesBySuburb(suburb: string): string[] {
  return SUBURB_DATABASE[suburb.toLowerCase().trim()] || [];
}

/**
 * Calculate Levenshtein distance for fuzzy matching
 * @param a First string
 * @param b Second string
 * @returns Distance score
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Suggest corrections for invalid postcodes
 * @param postcode The invalid postcode
 * @returns Array of suggested postcodes
 */
export function suggestPostcodes(postcode: string): string[] {
  const normalized = postcode.trim();
  const suggestions: string[] = [];

  // If it looks like a postcode (4 digits), find similar ones
  if (/^\d{4}$/.test(normalized)) {
    const postcodeNum = parseInt(normalized);
    const validPostcodes = Object.keys(POSTCODE_DATABASE).map((p) =>
      parseInt(p)
    );

    // Find postcodes within 100 of the input
    const nearby = validPostcodes
      .filter((p) => Math.abs(p - postcodeNum) <= 100)
      .sort((a, b) => Math.abs(a - postcodeNum) - Math.abs(b - postcodeNum))
      .slice(0, 5)
      .map((p) => String(p).padStart(4, "0"));

    suggestions.push(...nearby);
  }

  return suggestions;
}
