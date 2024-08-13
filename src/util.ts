import { inflate } from "pako";

export function decompressSlotInfo(str: string) {
  let playersDataBlock: string;
  try {
    playersDataBlock = decompressZlib(str);
  } catch (e) {
    throw new Error(`Could not decompress player data: ${str}`);
  }

  // 12,[{"profileInfo.id":  ...  }]

  let playersDataStr: string = playersDataBlock.substr(
    playersDataBlock.indexOf(",") + 1
  );
  let playersData: any[];
  try {
    playersData = JSON.parse(cleanStr(playersDataStr)) as any[];
  } catch (e) {
    throw new Error(`Could not parse player data json: ${playersDataStr}`);
  }

  // console.log('playersData', playersData);

  try {
    playersData.forEach(
      (pd) =>
        (pd.metaData =
          pd.metaData?.length > 0
            ? parsePlayerMetadata(Base64.decode(Base64.decode(pd.metaData)))
            : null)
    );
    // console.log('playersData', playersData);
    return playersData;
  } catch (e) {
    throw new Error(
      `Could not decode player metadata: ${playersData.map(
        (pd) => pd.metaData
      )}`
    );
  }
}

function parsePlayerMetadata(playerMetadata: string) {
  if (!playerMetadata) return null;

  // ♥☺0☺7‼ScenarioPlayerIndex☺7♦Team☺3
  // -----0----7----ScenarioPlayerIndex----7----Team----3
  // -0-7-ScenarioPlayerIndex-7-Team-3
  // [ '', '0', '7', 'ScenarioPlayerIndex', '7', 'Team', '3' ]

  playerMetadata = playerMetadata
    .split("")
    .map((ch) => (ch.charCodeAt(0) < 32 ? "-" : ch))
    .join("");
  playerMetadata = playerMetadata.replace(/-+/g, "-");
  const playerMetadataArr = playerMetadata.split("-");

  return {
    unknown1: playerMetadataArr[1],
    civ: playerMetadataArr[2],
    scenarioToPlayerIndex: playerMetadataArr[4],
    team: playerMetadataArr[6],
  };
}

// https://codebeautify.org/gzip-decompress-online
export function decompressZlib(str: string) {
  let compressData: any = atob(str);
  compressData = compressData.split("").map(function (e: any) {
    return e.charCodeAt(0);
  });
  return inflate(compressData, { to: "string" });
}

// https://stackoverflow.com/a/27725393/1106753
export function cleanStr(s: string) {
  // preserve newlines, etc - use valid JSON
  s = s
    .replace(/\\n/g, "\\n")
    .replace(/\\'/g, "\\'")
    .replace(/\\"/g, '\\"')
    .replace(/\\&/g, "\\&")
    .replace(/\\r/g, "\\r")
    .replace(/\\t/g, "\\t")
    .replace(/\\b/g, "\\b")
    .replace(/\\f/g, "\\f");
  // remove non-printable and other non-valid JSON chars
  s = s.replace(/[\u0000-\u0019]+/g, "");
  return s;
}

// https://codebeautify.org/base64-to-text-converter
export const Base64 = {
  _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
  encode: function (input: string) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;
    input = Base64._utf8_encode(input);
    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);
      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;
      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }
      output =
        output +
        this._keyStr.charAt(enc1) +
        this._keyStr.charAt(enc2) +
        this._keyStr.charAt(enc3) +
        this._keyStr.charAt(enc4);
    }
    return output;
  },
  decode: function (input: string) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    while (i < input.length) {
      enc1 = this._keyStr.indexOf(input.charAt(i++));
      enc2 = this._keyStr.indexOf(input.charAt(i++));
      enc3 = this._keyStr.indexOf(input.charAt(i++));
      enc4 = this._keyStr.indexOf(input.charAt(i++));
      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;
      output = output + String.fromCharCode(chr1);
      if (enc3 != 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 != 64) {
        output = output + String.fromCharCode(chr3);
      }
    }
    output = Base64._utf8_decode(output);
    return output;
  },
  _utf8_encode: function (string: string) {
    string = string.replace(/\r\n/g, "\n");
    var utftext = "";
    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  },
  _utf8_decode: function (utftext: string) {
    var string = "";
    var i = 0;
    let c = 0;
    let c1 = 0;
    let c2 = 0;
    let c3 = 0;
    while (i < utftext.length) {
      c = utftext.charCodeAt(i);
      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      } else if (c > 191 && c < 224) {
        c2 = utftext.charCodeAt(i + 1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        c2 = utftext.charCodeAt(i + 1);
        c3 = utftext.charCodeAt(i + 2);
        string += String.fromCharCode(
          ((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)
        );
        i += 3;
      }
    }
    return string;
  },
};

let timeLastDate: Date | null = null;
export function time(start?: any) {
  // if (!__DEV__) return;
  if (timeLastDate == null || start) {
    console.log("- " + start);
  } else {
    console.log(new Date().getTime() - timeLastDate.getTime());
  }
  timeLastDate = new Date();
}

export function decompressOptions(str: string) {
  let optionsBase64: string;
  try {
    optionsBase64 = decompressZlib(str);
  } catch (e) {
    throw new Error(`Could not decompress settings: ${str}`);
  }
  let optionsStr: string;
  try {
    optionsStr = Base64.decode(optionsBase64);
  } catch (e) {
    throw new Error(`Could not base64 decode settings: ${optionsBase64}`);
  }

  // char codes < 32
  return optionsStr.split(/[\x00-\x1F]+/);
}

function getSettingByKeyOrNull(settings: string[], key: string) {
  // console.log(settings, key);
  const entry = settings.find((x) => x.startsWith(`${key}:`));
  return entry ? entry.substr(entry.indexOf(":") + 1) : null;
}

export interface IOptionDict {
  record_game: boolean;
  empire_wars_mode: boolean;
  lock_teams: boolean;
  victory: number;
  shared_exploration: boolean;
  resources: number;
  team_positions: boolean;
  turbo_mode: boolean;
  full_tech_tree: boolean;
  speed: number;
  lock_speed: boolean;
  map_size: number;
  population: number;
  difficulty: number;
  team_together: boolean;
  allow_cheats: boolean;
  treaty_length: number;
  sudden_death_mode: boolean;
  reveal_map: number;
  ending_age: number;
  game_mode: number;
  location: number;
  regicide_mode: boolean;
  game_variant: number;
  starting_age: number;
  privacy: number;
  internal_leaderboard_id: number;
}

type OptionType = "int" | "bool" | "!bool";

interface OptionMapEntry {
  name: keyof IOptionDict;
  type: OptionType;
}

type OptionsMap = {
  [key: string]: OptionMapEntry;
};

const optionsMapAfterReturnOfRomeRelease: OptionsMap = {
  // Dont parse from options because we have it always in the match object in the relic api
  // 93: { name: 'internal_leaderboard_id', type: 'int' },

  0: { name: "starting_age", type: "int" },
  1: { name: "allow_cheats", type: "bool" },
  4: { name: "ending_age", type: "int" },
  5: { name: "game_mode", type: "int" },
  8: { name: "map_size", type: "int" },
  10: { name: "location", type: "int" },
  28: { name: "population", type: "int" },
  37: { name: "resources", type: "int" },
  41: { name: "speed", type: "int" },
  56: { name: "privacy", type: "int" },
  57: { name: "treaty_length", type: "int" },
  61: { name: "difficulty", type: "int" },
  62: { name: "full_tech_tree", type: "bool" },
  65: { name: "lock_speed", type: "bool" },
  66: { name: "lock_teams", type: "!bool" },
  75: { name: "record_game", type: "bool" },
  76: { name: "shared_exploration", type: "!bool" },
  77: { name: "team_positions", type: "bool" },
  78: { name: "team_together", type: "bool" },
  79: { name: "turbo_mode", type: "!bool" },
  81: { name: "victory", type: "int" },
  82: { name: "reveal_map", type: "int" },
  89: { name: "empire_wars_mode", type: "!bool" },
  90: { name: "sudden_death_mode", type: "!bool" },
  91: { name: "regicide_mode", type: "!bool" },
  97: { name: "game_variant", type: "int" }, // 1 means RoR, 97: 2 means AoE2.
};

const optionsMapBeforeReturnOfRomeRelease: OptionsMap = {
  // Dont parse from options because we have it always in the match object in the relic api
  // 93: { name: 'internal_leaderboard_id', type: 'int' },

  0: { name: "starting_age", type: "int" },
  1: { name: "allow_cheats", type: "bool" },
  5: { name: "ending_age", type: "int" },
  6: { name: "game_mode", type: "int" },
  9: { name: "map_size", type: "int" },
  11: { name: "location", type: "int" },
  29: { name: "population", type: "int" },
  38: { name: "resources", type: "int" },
  42: { name: "speed", type: "int" },
  57: { name: "privacy", type: "int" },
  58: { name: "treaty_length", type: "int" },
  62: { name: "difficulty", type: "int" },
  63: { name: "full_tech_tree", type: "bool" },
  66: { name: "lock_speed", type: "bool" },
  67: { name: "lock_teams", type: "!bool" },
  76: { name: "record_game", type: "bool" },
  77: { name: "shared_exploration", type: "!bool" },
  78: { name: "team_positions", type: "bool" },
  79: { name: "team_together", type: "bool" },
  80: { name: "turbo_mode", type: "!bool" },
  82: { name: "victory", type: "int" },
  83: { name: "reveal_map", type: "int" },
  90: { name: "empire_wars_mode", type: "!bool" },
  91: { name: "sudden_death_mode", type: "!bool" },
  92: { name: "regicide_mode", type: "!bool" },
};

export function parseOptions(options: string[]): IOptionDict {
  const optionsDict = {} as IOptionDict;

  const gameVariant = getSettingByKeyOrNull(options, "97");
  const optionsMap: OptionsMap =
    gameVariant == null
      ? optionsMapBeforeReturnOfRomeRelease
      : optionsMapAfterReturnOfRomeRelease;

  // console.log('gameVariant', gameVariant);

  for (const optionNum of Object.keys(optionsMap)) {
    const value = getSettingByKeyOrNull(options, optionNum);
    const option = optionsMap[optionNum];
    const parsedValue = parseOption(value, option.type);

    if (parsedValue !== null) {
      (optionsDict[option.name] as any) = parsedValue;
    }
  }

  return optionsDict;
}

function parseOption(
  value: string | null,
  type: OptionType
): number | boolean | null {
  switch (type) {
    case "int":
      return value ? parseInt(value) : null;
    case "bool":
      return value ? value === "y" : null;
    case "!bool":
      return value ? value !== "y" : null;
  }
}

interface MapsObject {
  [key: string]: {
    [key: string]: number;
  };
}
const maps: MapsObject = {
  Arabia: {
    "1": 9,
    "2": 10875,
    "3": 10875,
    "4": 10875,
    "5": 10875,
  },
  Archipelago: {
    "1": 10,
    "2": 10876,
    "3": 10876,
    "4": 10876,
    "5": 10876,
  },
  Baltic: {
    "1": 11,
    "2": 10877,
    "3": 10877,
    "4": 10877,
    "5": 10877,
  },
  BlackForest: {
    "1": 12,
    "2": 10878,
    "3": 10878,
    "4": 10878,
    "5": 10878,
  },
  Coastal: {
    "1": 13,
    "2": 10879,
    "3": 10879,
    "4": 10879,
    "5": 10879,
  },
  Continental: {
    "1": 14,
    "2": 10880,
    "3": 10880,
    "4": 10880,
    "5": 10880,
  },
  CraterLake: {
    "1": 15,
    "2": 10881,
    "3": 10881,
    "4": 10881,
    "5": 10881,
  },
  Fortress: {
    "1": 16,
    "2": 10882,
    "3": 10882,
    "4": 10882,
    "5": 10882,
  },
  GoldRush: {
    "1": 17,
    "2": 10883,
    "3": 10883,
    "4": 10883,
    "5": 10883,
  },
  Highland: {
    "1": 18,
    "2": 10884,
    "3": 10884,
    "4": 10884,
    "5": 10884,
  },
  Islands: {
    "1": 19,
    "2": 10885,
    "3": 10885,
    "4": 10885,
    "5": 10885,
  },
  Mediterranean: {
    "1": 20,
    "2": 10886,
    "3": 10886,
    "4": 10886,
    "5": 10886,
  },
  Migration: {
    "1": 21,
    "2": 10887,
    "3": 10887,
    "4": 10887,
    "5": 10887,
  },
  Rivers: {
    "1": 22,
    "2": 10888,
    "3": 10888,
    "4": 10888,
    "5": 10888,
  },
  TeamIslands: {
    "1": 23,
    "2": 10889,
    "3": 10889,
    "4": 10889,
    "5": 10889,
  },
  Scandanavia: {
    "1": 25,
    "2": 10891,
    "3": 10891,
    "4": 10891,
    "5": 10891,
  },
  Mongolia: {
    "1": 26,
    "2": 10892,
    "3": 10892,
    "4": 10892,
    "5": 10892,
  },
  Yucatan: {
    "1": 27,
    "2": 10894,
    "3": 10894,
    "4": 10894,
    "5": 10894,
  },
  SaltMarsh: {
    "1": 28,
    "2": 10893,
    "3": 10893,
    "4": 10893,
    "5": 10893,
  },
  Arena: {
    "1": 29,
    "2": 10895,
    "3": 10895,
    "4": 10895,
    "5": 10895,
  },
  Oasis: {
    "1": 31,
    "2": 10897,
    "3": 10897,
    "4": 10897,
    "5": 10897,
  },
  GhostLake: {
    "1": 32,
    "2": 10898,
    "3": 10898,
    "4": 10898,
    "5": 10898,
  },
  Nomad: {
    "1": 33,
    "2": 10901,
    "3": 10901,
    "4": 10901,
    "5": 10901,
  },
  Canals: {
    "1": 34,
    "2": 10985,
    "3": 10985,
    "4": 10985,
    "5": 10985,
  },
  Capricious: {
    "1": 35,
    "2": 10986,
    "3": 10986,
    "4": 10986,
    "5": 10986,
  },
  Dingos: {
    "1": 36,
    "2": 10987,
    "3": 10987,
    "4": 10987,
    "5": 10987,
  },
  Graveyards: {
    "1": 37,
    "2": 10988,
    "3": 10988,
    "4": 10988,
    "5": 10988,
  },
  Metropolis: {
    "1": 38,
    "2": 10989,
    "3": 10989,
    "4": 10989,
    "5": 10989,
  },
  Moats: {
    "1": 155,
    "2": 10946,
    "3": 10946,
    "4": 10946,
    "5": 10946,
  },
  ParadiseIsland: {
    "1": 40,
    "2": 10991,
    "3": 10991,
    "4": 10991,
    "5": 10991,
  },
  Pilgrims: {
    "1": 41,
    "2": 10992,
    "3": 10992,
    "4": 10992,
    "5": 10992,
  },
  Prairie: {
    "1": 42,
    "2": 10993,
    "3": 10993,
    "4": 10993,
    "5": 10993,
  },
  Seasons: {
    "1": 43,
    "2": 10994,
    "3": 10994,
    "4": 10994,
    "5": 10994,
  },
  SherwoodForest: {
    "1": 44,
    "2": 10995,
    "3": 10995,
    "4": 10995,
    "5": 10995,
  },
  SherwoodHeroes: {
    "1": 45,
    "2": 10996,
    "3": 10996,
    "4": 10996,
    "5": 10996,
  },
  Shipwreck: {
    "1": 46,
    "2": 10997,
    "3": 10997,
    "4": 10997,
    "5": 10997,
  },
  TeamGlaciers: {
    "1": 47,
    "2": 10998,
    "3": 10998,
    "4": 10998,
    "5": 10998,
  },
  TheUnknown: {
    "1": 48,
    "2": 10999,
    "3": 10999,
    "4": 10999,
    "5": 10999,
  },
  RealWorldSpain: {
    "1": 49,
    "2": 13544,
    "3": 13544,
    "4": 13544,
    "5": 13544,
  },
  RealWorldEngland: {
    "1": 50,
    "2": 13545,
    "3": 13545,
    "4": 13545,
    "5": 13545,
  },
  RealWorldMideast: {
    "1": 51,
    "2": 13546,
    "3": 13546,
    "4": 13546,
    "5": 13546,
  },
  RealWorldTexas: {
    "1": 52,
    "2": 13547,
    "3": 13547,
    "4": 13547,
    "5": 13547,
  },
  RealWorldItaly: {
    "1": 53,
    "2": 13548,
    "3": 13548,
    "4": 13548,
    "5": 13548,
  },
  RealWorldCaribbean: {
    "1": 54,
    "2": 13549,
    "3": 13549,
    "4": 13549,
    "5": 13549,
  },
  RealWorldFrance: {
    "1": 55,
    "2": 13550,
    "3": 13550,
    "4": 13550,
    "5": 13550,
  },
  RealWorldJutland: {
    "1": 56,
    "2": 13551,
    "3": 13551,
    "4": 13551,
    "5": 13551,
  },
  RealWorldNippon: {
    "1": 57,
    "2": 13552,
    "3": 13552,
    "4": 13552,
    "5": 13552,
  },
  RealWorldByzantium: {
    "1": 58,
    "2": 13553,
    "3": 13553,
    "4": 13553,
    "5": 13553,
  },
  Acropolis: {
    "1": 67,
    "2": 10914,
    "3": 10914,
    "4": 10914,
    "5": 10914,
  },
  Budapest: {
    "1": 68,
    "2": 10915,
    "3": 10915,
    "4": 10915,
    "5": 10915,
  },
  Cenotes: {
    "1": 69,
    "2": 10916,
    "3": 10916,
    "4": 10916,
    "5": 10916,
  },
  Cityoflakes: {
    "1": 70,
    "2": 10917,
    "3": 10917,
    "4": 10917,
    "5": 10917,
  },
  Goldenpit: {
    "1": 71,
    "2": 10918,
    "3": 10918,
    "4": 10918,
    "5": 10918,
  },
  Hideout: {
    "1": 72,
    "2": 10919,
    "3": 10919,
    "4": 10919,
    "5": 10919,
  },
  Hillfort: {
    "1": 73,
    "2": 10920,
    "3": 10920,
    "4": 10920,
    "5": 10920,
  },
  Lombardia: {
    "1": 74,
    "2": 10921,
    "3": 10921,
    "4": 10921,
    "5": 10921,
  },
  Steppe: {
    "1": 75,
    "2": 10922,
    "3": 10922,
    "4": 10922,
    "5": 10922,
  },
  Valley: {
    "1": 76,
    "2": 10923,
    "3": 10923,
    "4": 10923,
    "5": 10923,
  },
  Megarandom: {
    "1": 77,
    "2": 10924,
    "3": 10924,
    "4": 10924,
    "5": 10924,
  },
  Hamburger: {
    "1": 78,
    "2": 10925,
    "3": 10925,
    "4": 10925,
    "5": 10925,
  },
  CtrRandom: {
    "1": 79,
    "2": 10926,
    "3": 10926,
    "4": 10926,
    "5": 10926,
  },
  CtrMonsoon: {
    "1": 80,
    "2": 10927,
    "3": 10927,
    "4": 10927,
    "5": 10927,
  },
  CtrPyramidDescent: {
    "1": 81,
    "2": 10928,
    "3": 10928,
    "4": 10928,
    "5": 10928,
  },
  CtrSpiral: {
    "1": 82,
    "2": 10929,
    "3": 10929,
    "4": 10929,
    "5": 10929,
  },
  Kilimanjaro: {
    "1": 83,
    "2": -2,
    "3": 301100,
    "4": 301100,
    "5": 301100,
  },
  MountainPass: {
    "1": 84,
    "2": -2,
    "3": 301101,
    "4": 301101,
    "5": 301101,
  },
  NileDelta: {
    "1": 85,
    "2": -2,
    "3": 301102,
    "4": 301102,
    "5": 301102,
  },
  Serengeti: {
    "1": 86,
    "2": -2,
    "3": 301103,
    "4": 301103,
    "5": 301103,
  },
  Socotra: {
    "1": 87,
    "2": -2,
    "3": 301104,
    "4": 301104,
    "5": 301104,
  },
  RealWorldAmazon: {
    "1": 88,
    "2": -2,
    "3": 301105,
    "4": 301105,
    "5": 301105,
  },
  RealWorldChina: {
    "1": 89,
    "2": -2,
    "3": 301106,
    "4": 301106,
    "5": 301106,
  },
  RealWorldHornOfAfrica: {
    "1": 90,
    "2": -2,
    "3": 301107,
    "4": 301107,
    "5": 301107,
  },
  RealWorldIndia: {
    "1": 91,
    "2": -2,
    "3": 301108,
    "4": 301108,
    "5": 301108,
  },
  RealWorldMadagascar: {
    "1": 92,
    "2": -2,
    "3": 301109,
    "4": 301109,
    "5": 301109,
  },
  RealWorldWestAfrica: {
    "1": 93,
    "2": -2,
    "3": 301110,
    "4": 301110,
    "5": 301110,
  },
  RealWorldBohemia: {
    "1": 94,
    "2": -2,
    "3": 301111,
    "4": 301111,
    "5": 301111,
  },
  RealWorldEarth: {
    "1": 95,
    "2": -2,
    "3": 301112,
    "4": 301112,
    "5": 301112,
  },
  SpecialMapCanyons: {
    "1": 96,
    "2": -2,
    "3": 301113,
    "4": 301113,
    "5": 301113,
  },
  SpecialMapArchipelago: {
    "1": 97,
    "2": -2,
    "3": 301114,
    "4": 301114,
    "5": 301114,
  },
  SpecialMapEnemyIslands: {
    "1": 98,
    "2": -2,
    "3": 301115,
    "4": 301115,
    "5": 301115,
  },
  SpecialMapFarOut: {
    "1": 99,
    "2": -2,
    "3": 301116,
    "4": 301116,
    "5": 301116,
  },
  SpecialMapFrontLine: {
    "1": 100,
    "2": -2,
    "3": 301117,
    "4": 301117,
    "5": 301117,
  },
  SpecialMapInnerCircle: {
    "1": 101,
    "2": -2,
    "3": 301118,
    "4": 301118,
    "5": 301118,
  },
  SpecialMapMotherland: {
    "1": 102,
    "2": -2,
    "3": 301119,
    "4": 301119,
    "5": 301119,
  },
  SpecialMapOpenPlains: {
    "1": 103,
    "2": -2,
    "3": 301120,
    "4": 301120,
    "5": 301120,
  },
  SpecialMapRingOfWater: {
    "1": 104,
    "2": -2,
    "3": 301121,
    "4": 301121,
    "5": 301121,
  },
  SpecialMapSnakePit: {
    "1": 105,
    "2": -2,
    "3": 301122,
    "4": 301122,
    "5": 301122,
  },
  SpecialMapTheEye: {
    "1": 106,
    "2": -2,
    "3": 301123,
    "4": 301123,
    "5": 301123,
  },
  RealWorldAustralia: {
    "1": 107,
    "2": -2,
    "3": 301124,
    "4": 301124,
    "5": 301124,
  },
  RealWorldIndochina: {
    "1": 108,
    "2": -2,
    "3": 301125,
    "4": 301125,
    "5": 301125,
  },
  RealWorldIndonesia: {
    "1": 109,
    "2": -2,
    "3": 301126,
    "4": 301126,
    "5": 301126,
  },
  RealWorldMalacca: {
    "1": 110,
    "2": -2,
    "3": 301127,
    "4": 301127,
    "5": 301127,
  },
  RealWorldPhilippines: {
    "1": 111,
    "2": -2,
    "3": 301128,
    "4": 301128,
    "5": 301128,
  },
  BogIslands: {
    "1": 112,
    "2": -2,
    "3": 301129,
    "4": 301129,
    "5": 301129,
  },
  MangroveJungle: {
    "1": 113,
    "2": -2,
    "3": 301130,
    "4": 301130,
    "5": 301130,
  },
  PacificIslands: {
    "1": 114,
    "2": -2,
    "3": 301131,
    "4": 301131,
    "5": 301131,
  },
  Sandbank: {
    "1": 115,
    "2": -2,
    "3": 301132,
    "4": 301132,
    "5": 301132,
  },
  WaterNomad: {
    "1": 116,
    "2": -2,
    "3": 301133,
    "4": 301133,
    "5": 301133,
  },
  SpecialMapJungleIslands: {
    "1": 117,
    "2": -2,
    "3": 301134,
    "4": 301134,
    "5": 301134,
  },
  SpecialMapHolyLine: {
    "1": 118,
    "2": -2,
    "3": 301135,
    "4": 301135,
    "5": 301135,
  },
  SpecialMapBorderStones: {
    "1": 119,
    "2": -2,
    "3": 301136,
    "4": 301136,
    "5": 301136,
  },
  SpecialMapYinYang: {
    "1": 120,
    "2": -2,
    "3": 301137,
    "4": 301137,
    "5": 301137,
  },
  SpecialMapJungleLanes: {
    "1": 121,
    "2": -2,
    "3": 301138,
    "4": 301138,
    "5": 301138,
  },
  AlpineLakes: {
    "1": 122,
    "2": -2,
    "3": 301139,
    "4": 301139,
    "5": 301139,
  },
  Bogland: {
    "1": 123,
    "2": -2,
    "3": 301141,
    "4": 301141,
    "5": 301141,
  },
  MountainRidge: {
    "1": 124,
    "2": -2,
    "3": 301142,
    "4": 301142,
    "5": 301142,
  },
  Ravines: {
    "1": 125,
    "2": -2,
    "3": 301143,
    "4": 301143,
    "5": 301143,
  },
  WolfHill: {
    "1": 126,
    "2": -2,
    "3": 301144,
    "4": 301144,
    "5": 301144,
  },
  SwirlingRiverSpecial: {
    "1": 127,
    "2": -2,
    "3": 301150,
    "4": 301150,
    "5": 301150,
  },
  TwinForestsSpecial: {
    "1": 128,
    "2": -2,
    "3": 301151,
    "4": 301151,
    "5": 301151,
  },
  JourneySouthSpecial: {
    "1": 129,
    "2": -2,
    "3": 301152,
    "4": 301152,
    "5": 301152,
  },
  SnakeForestSpecial: {
    "1": 130,
    "2": -2,
    "3": 301153,
    "4": 301153,
    "5": 301153,
  },
  SprawlingStreamsSpecial: {
    "1": 131,
    "2": -2,
    "3": 301154,
    "4": 301154,
    "5": 301154,
  },
  RealWorldAntarctica: {
    "1": 132,
    "2": -2,
    "3": 301145,
    "4": 301145,
    "5": 301145,
  },
  RealWorldAralSea: {
    "1": 133,
    "2": -2,
    "3": 301146,
    "4": 301146,
    "5": 301146,
  },
  RealWorldBlackSea: {
    "1": 134,
    "2": -2,
    "3": 301147,
    "4": 301147,
    "5": 301147,
  },
  RealWorldCaucasus: {
    "1": 135,
    "2": -2,
    "3": 301148,
    "4": 301148,
    "5": 301148,
  },
  RealWorldSiberia: {
    "1": 136,
    "2": -2,
    "3": 301149,
    "4": 301149,
    "5": 301149,
  },
  GoldenSwamp: {
    "1": 139,
    "2": 10930,
    "3": 10930,
    "4": 10930,
    "5": 10930,
  },
  FourLakes: {
    "1": 140,
    "2": 10931,
    "3": 10931,
    "4": 10931,
    "5": 10931,
  },
  LandNomad: {
    "1": 141,
    "2": 10932,
    "3": 10932,
    "4": 10932,
    "5": 10932,
  },
  BattleOnTheIce: {
    "1": 142,
    "2": 10933,
    "3": 10933,
    "4": 10933,
    "5": 10933,
  },
  ElDorado: {
    "1": 143,
    "2": 10934,
    "3": 10934,
    "4": 10934,
    "5": 10934,
  },
  FallOfAxum: {
    "1": 144,
    "2": 10935,
    "3": 10935,
    "4": 10935,
    "5": 10935,
  },
  FallOfRome: {
    "1": 145,
    "2": 10936,
    "3": 10936,
    "4": 10936,
    "5": 10936,
  },
  TheMajapahitEmpire: {
    "1": 146,
    "2": 10937,
    "3": 10937,
    "4": 10937,
    "5": 10937,
  },
  AmazonTunnel: {
    "1": 147,
    "2": 10938,
    "3": 10938,
    "4": 10938,
    "5": 10938,
  },
  CoastalForest: {
    "1": 148,
    "2": 10939,
    "3": 10939,
    "4": 10939,
    "5": 10939,
  },
  AfricanClearing: {
    "1": 149,
    "2": 10940,
    "3": 10940,
    "4": 10940,
    "5": 10940,
  },
  Atacama: {
    "1": 150,
    "2": 10941,
    "3": 10941,
    "4": 10941,
    "5": 10941,
  },
  SeizeTheMountain: {
    "1": 151,
    "2": 10942,
    "3": 10942,
    "4": 10942,
    "5": 10942,
  },
  Crater: {
    "1": 152,
    "2": 10943,
    "3": 10943,
    "4": 10943,
    "5": 10943,
  },
  Crossroads: {
    "1": 153,
    "2": 10944,
    "3": 10944,
    "4": 10944,
    "5": 10944,
  },
  Michi: {
    "1": 154,
    "2": 10945,
    "3": 10945,
    "4": 10945,
    "5": 10945,
  },
  VolcanicIsland: {
    "1": 156,
    "2": 10947,
    "3": 10947,
    "4": 10947,
    "5": 10947,
  },
  Acclivity: {
    "1": 157,
    "2": 10948,
    "3": 10948,
    "4": 10948,
    "5": 10948,
  },
  Eruption: {
    "1": 158,
    "2": 10949,
    "3": 10949,
    "4": 10949,
    "5": 10949,
  },
  FrigidLake: {
    "1": 159,
    "2": 10950,
    "3": 10950,
    "4": 10950,
    "5": 10950,
  },
  Greenland: {
    "1": 160,
    "2": 10951,
    "3": 10951,
    "4": 10951,
    "5": 10951,
  },
  Lowland: {
    "1": 161,
    "2": 10952,
    "3": 10952,
    "4": 10952,
    "5": 10952,
  },
  Marketplace: {
    "1": 162,
    "2": 10953,
    "3": 10953,
    "4": 10953,
    "5": 10953,
  },
  Meadow: {
    "1": 163,
    "2": 10954,
    "3": 10954,
    "4": 10954,
    "5": 10954,
  },
  MountainRange: {
    "1": 164,
    "2": 10955,
    "3": 10955,
    "4": 10955,
    "5": 10955,
  },
  NorthernIsles: {
    "1": 165,
    "2": 10956,
    "3": 10956,
    "4": 10956,
    "5": 10956,
  },
  RingFortress: {
    "1": 166,
    "2": 10957,
    "3": 10957,
    "4": 10957,
    "5": 10957,
  },
  Runestones: {
    "1": 167,
    "2": 10958,
    "3": 10958,
    "4": 10958,
    "5": 10958,
  },
  Aftermath: {
    "1": 168,
    "2": 10959,
    "3": 10959,
    "4": 10959,
    "5": 10959,
  },
  Enclosed: {
    "1": 169,
    "2": 10960,
    "3": 10960,
    "4": 10960,
    "5": 10960,
  },
  Haboob: {
    "1": 170,
    "2": 10961,
    "3": 10961,
    "4": 10961,
    "5": 10961,
  },
  Kawasan: {
    "1": 171,
    "2": 10962,
    "3": 10962,
    "4": 10962,
    "5": 10962,
  },
  LandMadness: {
    "1": 172,
    "2": 10963,
    "3": 10963,
    "4": 10963,
    "5": 10963,
  },
  SacredSprings: {
    "1": 173,
    "2": 10964,
    "3": 10964,
    "4": 10964,
    "5": 10964,
  },
  Wade: {
    "1": 174,
    "2": 10965,
    "3": 10965,
    "4": 10965,
    "5": 10965,
  },
  Morass: {
    "1": 175,
    "2": 10966,
    "3": 10966,
    "4": 10966,
    "5": 10966,
  },
  Shoals: {
    "1": 176,
    "2": 10967,
    "3": 10967,
    "4": 10967,
    "5": 10967,
  },
  Cliffbound: {
    "1": -1,
    "4": -1,
    "3": -1,
    "2": -1,
    "5": 10968,
  },
  Isthmus: {
    "1": -1,
    "4": -1,
    "3": -1,
    "2": -1,
    "5": 10969,
  },
  Dunesprings: {
    "1": -1,
    "4": -1,
    "3": -1,
    "2": -1,
    "5": 10970,
  },
  GoldenStream: {
    "1": -1,
    "4": -1,
    "3": -1,
    "2": -1,
    "5": 10971,
  },
  MountainDunes: {
    "1": -1,
    "4": -1,
    "3": -1,
    "2": -1,
    "5": 10972,
  },
  RiverDivide: {
    "1": -1,
    "4": -1,
    "3": -1,
    "2": -1,
    "5": 10973,
  },
  Sandrift: {
    "1": -1,
    "4": -1,
    "3": -1,
    "2": -1,
    "5": 10974,
  },
  Shrubland: {
    "1": -1,
    "4": -1,
    "3": -1,
    "2": -1,
    "5": 10975,
  },
  Passage: {
    "1": -1,
    "4": -1,
    "3": -1,
    "2": -1,
    "5": 10976,
  },
  HollowWoodlands: {
    "1": -1,
    "4": -1,
    "3": -1,
    "2": -1,
    "5": 10977,
  },
  Karsts: {
    "1": -1,
    "4": -1,
    "3": -1,
    "2": -1,
    "5": 10978,
  },
};

export const mapIdToMapName: { [key: number]: string } = {};

for (const [mapName, leaderboardIdMap] of Object.entries(maps)) {
  for (const mapId of Object.values(leaderboardIdMap)) {
    if (mapId > 0) {
      mapIdToMapName[mapId] = mapName;
    }
  }
}
