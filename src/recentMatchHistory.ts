import {
  EdgeLinkApiClient,
  GetRecentMatchHistoryResponse,
  MatchHistoryStats,
  Profile,
} from "./client";
import {
  decompressOptions,
  decompressSlotInfo,
  parseOptions,
  mapIdToMapName,
} from "./util";

export interface Match {
  id: number;
  map: string;
  parsedMap: string;
  rawMapId: number;
  players: MatchPlayer[];
  matchTypeId: number;
  startTime: number;
  endTime: number;
  maxPlayers: number;
  slotInfo: string;
  options: string;
  description: string;
  observerTotal: number;
}

export interface SlotInfoMetadata {
  unknown1: number;
  civ: number;
  scenarioToPlayerIndex: number;
  team: number;
}

export interface SlotInfo {
  stationId: number;
  teamId: number;
  factionId: number;
  raceId: number;
  rankLevel: number;
  rankMatchTypeId: number;
  timePerFrameMs: number;
  isReady: number;
  status: number;
  metadata: SlotInfoMetadata;
}

export interface MatchPlayer {
  matchId: number;
  profileId: number;
  civilizationId: number;
  startingElo: number;
  endingElo: number;
  wins: number;
  losses: number;
  streak: number;
  won: boolean;
  country: string;
  steamId: string;
  alias: string;
  teamId: number;
  slotInfo: SlotInfo;
}

export class RecentMatchHistory {
  private _response: GetRecentMatchHistoryResponse;

  public static async get(ids: number[]): Promise<RecentMatchHistory> {
    let client = new EdgeLinkApiClient();
    let recentMatchHistoryResponse = await client.getRecentMatchHistory(ids);
    return new RecentMatchHistory(recentMatchHistoryResponse);
  }

  public static async getMultiple(
    ids: number[]
  ): Promise<RecentMatchHistory[]> {
    let client = new EdgeLinkApiClient();
    const maxCountPerRequest = 5;
    const requests = [];

    while (ids.length > 0) {
      const idsToRequest = ids.splice(0, maxCountPerRequest);
      requests.push(client.getRecentMatchHistory(idsToRequest));
    }
    const responses = await Promise.all(requests);
    return responses.map((response) => new RecentMatchHistory(response));
  }

  constructor(response: GetRecentMatchHistoryResponse) {
    this._response = response;
  }

  private isRankedMatch(match: MatchHistoryStats): boolean {
    return match.description === "AUTOMATCH";
  }

  private hasReplayUrls(match: MatchHistoryStats): boolean {
    return match.matchurls.length > 0;
  }

  private hasValidCompletionTime(match: MatchHistoryStats): boolean {
    const currentTime = Math.round(Date.now() / 1000);
    const fiveMinutesAgo = currentTime - 300;
    const oneWeekAgo = currentTime - 168 * 60 * 60;
    return (
      match.completiontime <= fiveMinutesAgo &&
      match.completiontime > oneWeekAgo
    );
  }

  getMatches(): Array<Match> {
    const profileMap = new Map<number, Profile>();
    for (const profile of this._response.profiles) {
      profileMap.set(profile.profile_id, profile);
    }

    return this._response.matchHistoryStats.map((match) => {
      const slotInfo = decompressSlotInfo(match.slotinfo);
      const options = parseOptions(decompressOptions(match.options));

      const playerSlotInfoMap = new Map<number, SlotInfo>();
      for (const slot of slotInfo) {
        playerSlotInfoMap.set(slot["profileInfo.id"], {
          stationId: slot.stationID,
          teamId: slot.teamID,
          factionId: slot.factionID,
          raceId: slot.raceID,
          rankLevel: slot.rankLevel,
          rankMatchTypeId: slot.rankMakeTypeID,
          timePerFrameMs: slot.timePerFrameMS,
          isReady: slot.isReady,
          status: slot.status,
          metadata: {
            unknown1: parseInt(slot.metaData?.unknown1 || "-3"),
            civ: parseInt(slot.metaData?.civ || "-3"),
            scenarioToPlayerIndex: parseInt(
              slot.metaData?.scenarioToPlayerIndex || "-3"
            ),
            team: parseInt(slot.metaData?.team || "-3"),
          },
        });
      }

      return {
        id: match.id,
        map: match.mapname,
        parsedMap: mapIdToMapName[options.location],
        rawMapId: options.location,
        players: match.matchhistorymember.map((player) => {
          const profile = profileMap.get(player.profile_id);
          const slot = playerSlotInfoMap.get(player.profile_id)!;
          return {
            matchId: match.id,
            profileId: player.profile_id,
            civilizationId: player.civilization_id,
            startingElo: player.oldrating,
            endingElo: player.newrating,
            wins: player.wins,
            losses: player.losses,
            streak: player.streak,
            won: player.outcome === 1,
            alias: profile?.alias || "Unknown",
            country: profile?.country || "Unknown",
            steamId: profile?.name || "Unknown",
            teamId: player.teamid,
            slotInfo: slot,
          };
        }),
        matchTypeId: match.matchtype_id,
        startTime: match.startgametime,
        endTime: match.completiontime,
        slotInfo: match.slotinfo,
        options: match.options,
        maxPlayers: match.maxplayers,
        observerTotal: match.observertotal,
        description: match.description,
      };
    });
  }
}
