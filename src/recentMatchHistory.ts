import {
  EdgeLinkApiClient,
  GetRecentMatchHistoryResponse,
  MatchHistoryStats,
  Profile,
} from "./client";

export interface Match {
  id: number;
  map: string;
  players: MatchPlayer[];
  matchTypeId: number;
  startTime: number;
  endTime: number;
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

  getMatches(matchTypeIds: Set<number>): Array<Match> {
    const profileMap = new Map<number, Profile>();
    for (const profile of this._response.profiles) {
      profileMap.set(profile.profile_id, profile);
    }

    const matches = this._response.matchHistoryStats.filter((match) => {
      return matchTypeIds.has(match.matchtype_id);
    });

    return matches.map((match) => {
      return {
        id: match.id,
        map: match.mapname,
        players: match.matchhistorymember.map((player) => {
          const profile = profileMap.get(player.profile_id);
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
          };
        }),
        matchTypeId: match.matchtype_id,
        startTime: match.startgametime,
        endTime: match.completiontime,
      };
    });
  }
}
