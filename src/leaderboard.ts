import {
  EdgeLinkApiClient,
  GetLeaderboardResponse,
  LeaderboardStat,
} from "./client";

export interface LeaderboardPlayer {
  profileId: number;
  alias: string;
  rank: number;
  lastMatchDate: number;
  wins: number;
  losses: number;
  streak: number;
  disputes: number;
  drops: number;
  rating: number;
  highestRank: number;
  highestRating: number;
  country: string;
  steamId: string;
}

export class Leaderboard {
  private _leaderboardId: number;
  private _response: GetLeaderboardResponse;

  public static async get(
    id: number,
    start?: number,
    count?: number
  ): Promise<Leaderboard> {
    let client = new EdgeLinkApiClient();
    let leaderboardResponse = await client.getLeaderboard(id, start, count);
    return new Leaderboard(id, leaderboardResponse);
  }

  public static async getMultiple(
    id: number,
    start: number,
    count: number
  ): Promise<Leaderboard[]> {
    let client = new EdgeLinkApiClient();
    const maxCountPerRequest = 200;
    const requests = [];

    for (let i = 0; i < count; i += maxCountPerRequest) {
      const requestCount = Math.min(maxCountPerRequest, count - i);
      requests.push(client.getLeaderboard(id, start + i, requestCount));
    }

    const responses = await Promise.all(requests);
    return responses.map((response) => new Leaderboard(id, response));
  }

  constructor(id: number, response: GetLeaderboardResponse) {
    this._leaderboardId = id;
    this._response = response;
  }

  leaderboardId(): number {
    return this._leaderboardId;
  }

  players(): LeaderboardPlayer[] {
    let players: LeaderboardPlayer[] = [];
    let statGroupIdMap: Map<number, LeaderboardStat> = new Map();
    for (const leaderboardStat of this._response.leaderboardStats) {
      statGroupIdMap.set(leaderboardStat.statgroup_id, leaderboardStat);
    }

    for (const statGroup of this._response.statGroups) {
      let leaderboardStat = statGroupIdMap.get(statGroup.id);
      if (leaderboardStat) {
        let player: LeaderboardPlayer = {
          profileId: statGroup.members[0].profile_id,
          alias: statGroup.members[0].alias,
          rank: leaderboardStat.rank,
          lastMatchDate: leaderboardStat.lastmatchdate,
          wins: leaderboardStat.wins,
          losses: leaderboardStat.losses,
          streak: leaderboardStat.streak,
          disputes: leaderboardStat.disputes,
          drops: leaderboardStat.drops,
          rating: leaderboardStat.rating,
          highestRank: leaderboardStat.highestrank,
          highestRating: leaderboardStat.highestrating,
          country: statGroup.members[0].country,
          steamId: statGroup.members[0].name,
        };
        players.push(player);
      }
    }
    return players;
  }

  profileIds(): number[] {
    let idSet = new Set<number>();
    for (const stat of this._response.statGroups) {
      idSet.add(stat.members[0].profile_id);
    }
    return Array.from(idSet);
  }

  responseJson(): GetLeaderboardResponse {
    return this._response;
  }
}
