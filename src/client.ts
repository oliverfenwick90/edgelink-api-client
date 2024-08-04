export interface Result {
  code: number;
  message: string;
}

export interface GetAvailableLeaderboardsResponse {
  result: Result;
  leaderboards: LeaderboardResponse[];
  matchTypes: MatchType[];
  races: Race[];
  factions: any[];
  leaderboardRegions: LeaderboardRegion[];
}

export enum LeaderboardName {
  SOLO_DM_RANKED = "SOLO_DM_RANKED",
  TEAM_DM_RANKED = "TEAM_DM_RANKED",
  SOLO_RM_RANKED = "SOLO_RM_RANKED",
  TEAM_RM_RANKED = "TEAM_RM_RANKED",
  SOLO_BR_RANKED = "SOLO_BR_RANKED",
  SOLO_EW_RANKED = "SOLO_EW_RANKED",
  TEAM_EW_RANKED = "TEAM_EW_RANKED",
  CO_SOLO_RM_RANKED = "CO_SOLO_RM_RANKED",
  CO_TEAM_RM_RANKED = "CO_TEAM_RM_RANKED",
  CO_SOLO_EW_RANKED = "CO_SOLO_EW_RANKED",
  CO_TEAM_EW_RANKED = "CO_TEAM_EW_RANKED",
  SOLO_POM_CUSTOM_RANKED = "SOLO_POM_CUSTOM_RANKED",
  TEAM_POM_CUSTOM_RANKED = "TEAM_POM_CUSTOM_RANKED",
  RBW_El_Reinado = "RBW_El_Reinado",
}

export interface LeaderboardResponse {
  id: number;
  name: LeaderboardName;
  isranked: number;
  leaderboardmap: LeaderboardMap[];
}

export interface LeaderboardMap {
  matchtype_id: number;
  statgroup_type: number;
  race_id: number;
  civilization_id: number;
}

export enum MatchTypeName {
  ONE_V_ONE = "1V1",
  TWO_V_TWO = "2V2",
  THREE_V_THREE = "3V3",
  FOUR_V_FOUR = "4V4",
  FFA = "FFA",
  CUSTOM_DM_ONE_V_ONE = "CUSTOM_DM_1v1",
  CUSTOM_DM_TEAM = "CUSTOM_DM_TEAM",
  CUSTOM_POM_ONE_V_ONE = "CUSTOM_POM_1v1",
  CUSTOM_POM_TEAM = "CUSTOM_POM_TEAM",
  RBW_EL_REINADO = "RBW_EL_REINADO",
}

export interface MatchType {
  id: number;
  name: MatchTypeName;
  locstringid: number;
}

export enum RaceName {
  AZTEC = "Aztec",
  BERBERS = "Berbers",
  BRITONS = "Britons",
  BULGARIANS = "Bulgarians",
  BURMESE = "Burmese",
  BYZANTINES = "Byzantines",
  CELTS = "Celts",
  CHINESE = "Chinese",
  CUMANS = "Cumans",
  ETHIOPIANS = "Ethiopians",
  FRANKS = "Franks",
  GOTHS = "Goths",
  HUNS = "Huns",
  INCAS = "Incas",
  HINDUSTANIS = "Hindustanis",
  ITALIANS = "Italians",
  JAPANESE = "Japanese",
  KHMER = "Khmer",
  KOREANS = "Koreans",
  LITHUANIANS = "Lithuanians",
  MAGYARS = "Magyars",
  MALAY = "Malay",
  MALIANS = "Malians",
  MAYANS = "Mayans",
  MONGOLS = "Mongols",
  PERSIANS = "Persians",
  PORTUGUESE = "Portuguese",
  SARACENS = "Saracens",
  SLAVS = "Slavs",
  SPANISH = "Spanish",
  TATARS = "Tatars",
  TEUTONS = "Teutons",
  TURKS = "Turks",
  VIETNAMESE = "Vietnamese",
  VIKINGS = "Vikings",
  BURGUNDIANS = "Burgundians",
  SICILIANS = "Sicilians",
  POLES = "Poles",
  BOHEMIANS = "Bohemians",
  BENGALIS = "Bengalis",
  DRAVIDIANS = "Dravidians",
  GURJARAS = "Gurjaras",
  ROMANS = "Romans",
  ARMENIANS = "Armenians",
  GEORGIANS = "Georgians",
}

export interface Race {
  id: number;
  name: RaceName;
  faction_id: number;
  locstringid: number;
}

export enum RegionName {
  EUROPE = "Europe",
  MIDDLE_EAST = "Middle East",
  ASIA = "Asia",
  NORTH_AMERICA = "North America",
  SOUTH_AMERICA = "South America",
  OCEANIA = "Oceania",
  AFRICA = "Africa",
  UNKNOWN = "Unknown",
}

export interface LeaderboardRegion {
  id: number;
  name: RegionName;
  locstringid: number;
}

export interface GetLeaderboardResponse {
  result: Result;
  statGroups: StatGroup[];
  leaderboardStats: LeaderboardStat[];
  rankTotal: number;
}

export interface StatGroup {
  id: number;
  name: string;
  type: number;
  members: Member[];
}

export interface Member {
  profile_id: number;
  name: string;
  alias: string;
  personal_statgroup_id: number;
  xp: number;
  level: number;
  leaderboardregion_id: number;
  country: string;
}

export interface LeaderboardStat {
  statgroup_id: number;
  leaderboard_id: number;
  wins: number;
  losses: number;
  streak: number;
  disputes: number;
  drops: number;
  rank: number;
  ranktotal: number;
  ranklevel: number;
  rating: number;
  regionrank: number;
  regionranktotal: number;
  lastmatchdate: number;
  highestrank: number;
  highestranklevel: number;
  highestrating: number;
}

export interface GetRecentMatchHistoryResponse {
  result: Result;
  matchHistoryStats: MatchHistoryStats[];
  profiles: Profile[];
}

export interface MatchHistoryStats {
  id: number;
  creator_profile_id: number;
  mapname: string;
  maxplayers: number;
  matchtype_id: number;
  options: string;
  slotinfo: string;
  description: string;
  startgametime: number;
  completiontime: number;
  observertotal: number;
  matchhistoryreportresults: MatchHistoryReportResult[];
  matchhistoryitems: any[];
  matchurls: MatchURL[];
  matchhistorymember: MatchHistoryMember[];
}

export interface MatchHistoryReportResult {
  matchhistory_id: number;
  profile_id: number;
  resulttype: number;
  teamid: number;
  race_id: number;
  xpgained: number;
  counters: string;
  matchstartdate: number;
  civilization_id: number;
}

export interface MatchHistoryMember {
  matchhistory_id: number;
  profile_id: number;
  race_id: number;
  statgroup_id: number;
  teamid: number;
  wins: number;
  losses: number;
  streak: number;
  arbitration: number;
  outcome: number;
  oldrating: number;
  newrating: number;
  reporttype: number;
  civilization_id: number;
}

export interface MatchURL {
  profile_id: number;
  url: string;
  size: number;
  datatype: number;
}

export interface Profile {
  profile_id: number;
  name: string;
  alias: string;
  personal_statgroup_id: number;
  xp: number;
  level: number;
  leaderboardregion_id: number;
  country: string;
}

export class EdgeLinkApiClient {
  private static readonly AOE_WORLDS_EDGE_LINK_BASE_URL =
    "https://aoe-api.worldsedgelink.com/community";
  private static readonly GET_AVAILABLE_LEADERBOARDS_URL = `${EdgeLinkApiClient.AOE_WORLDS_EDGE_LINK_BASE_URL}/leaderboard/getAvailableLeaderboards?title=age2`;
  private static readonly GET_LEADERBOARD_BASE_URL = `${EdgeLinkApiClient.AOE_WORLDS_EDGE_LINK_BASE_URL}/leaderboard/getLeaderBoard2?title=age2`;
  private static readonly GET_RECENT_MATCH_HISTORY_BASE_URL = `${EdgeLinkApiClient.AOE_WORLDS_EDGE_LINK_BASE_URL}/leaderboard/getRecentMatchHistory?title=age2`;

  private getLeaderboardUrl(
    leaderboardId: number,
    start: number = 1,
    count: number = 200
  ): string {
    return `${EdgeLinkApiClient.GET_LEADERBOARD_BASE_URL}&leaderboard_id=${leaderboardId}&start=${start}&count=${count}`;
  }

  private getRecentMatchHistoryUrl(profileIds: number[]): string {
    return `${
      EdgeLinkApiClient.GET_RECENT_MATCH_HISTORY_BASE_URL
    }&profile_ids=[${profileIds.join(",")}]`;
  }

  private async fetchWithRetry<T>(url: string): Promise<T> {
    for (let retry = 0; retry < 6; retry++) {
      const response = await fetch(url);
      if (response.status !== 200) {
        console.log(
          `Request attempt ${retry + 1} to ${url} failed with status ${
            response.status
          }`
        );
        const backoffTime = Math.pow(2, retry) * 1000;
        await new Promise((resolve) => setTimeout(resolve, backoffTime));
      } else {
        try {
          const jsonResponse = await response.json();
          return jsonResponse;
        } catch (e) {
          console.log(
            `Request attempt ${
              retry + 1
            } to ${url} failed to parse response as JSON: ${e}`
          );
          const backoffTime = Math.pow(2, retry) * 1000;
          await new Promise((resolve) => setTimeout(resolve, backoffTime));
        }
      }
    }
    throw new Error(`Request to ${url} failed after 6 retries`);
  }

  public async getAvailableLeaderboards(): Promise<GetAvailableLeaderboardsResponse> {
    return this.fetchWithRetry<GetAvailableLeaderboardsResponse>(
      EdgeLinkApiClient.GET_AVAILABLE_LEADERBOARDS_URL
    );
  }

  public async getLeaderboard(
    leaderboardId: number,
    start?: number,
    count?: number
  ): Promise<GetLeaderboardResponse> {
    return this.fetchWithRetry<GetLeaderboardResponse>(
      this.getLeaderboardUrl(leaderboardId, start, count)
    );
  }

  public async getRecentMatchHistory(
    profileIds: number[]
  ): Promise<GetRecentMatchHistoryResponse> {
    return this.fetchWithRetry<GetRecentMatchHistoryResponse>(
      this.getRecentMatchHistoryUrl(profileIds)
    );
  }
}
