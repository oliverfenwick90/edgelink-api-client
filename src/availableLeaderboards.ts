import { EdgeLinkApiClient, GetAvailableLeaderboardsResponse } from "./client";

export interface AvailableLeaderboard {
  id: number;
  name: string;
}

export class AvailableLeaderboards {
  private _response: GetAvailableLeaderboardsResponse;

  public static async get(): Promise<AvailableLeaderboards> {
    let client = new EdgeLinkApiClient();
    let getAvailableLeaderboardsResponse =
      await client.getAvailableLeaderboards();
    return new AvailableLeaderboards(getAvailableLeaderboardsResponse);
  }

  constructor(response: GetAvailableLeaderboardsResponse) {
    this._response = response;
  }

  getMatchTypeIds(leaderboardId: number): Set<number> {
    const leaderboard = this._response.leaderboards.find(
      (leaderboard) => leaderboard.id === leaderboardId
    );
    if (!leaderboard) {
      return new Set();
    }
    return new Set(leaderboard.leaderboardmap.map((m) => m.matchtype_id));
  }

  getLeaderboardIds(): Array<number> {
    return this._response.leaderboards.map((leaderboard) => leaderboard.id);
  }

  getAvailableLeaderboards(): Array<AvailableLeaderboard> {
    return this._response.leaderboards.map((leaderboard) => {
      return {
        id: leaderboard.id,
        name: leaderboard.name,
      };
    });
  }
}
