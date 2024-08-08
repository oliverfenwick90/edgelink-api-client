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
    } else {
      console.log("this happened");
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
