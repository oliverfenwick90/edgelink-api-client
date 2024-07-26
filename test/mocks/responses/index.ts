import {
  GetAvailableLeaderboardsResponse,
  GetLeaderboardResponse,
  GetRecentMatchHistoryResponse,
} from "../../../src/client";

const getAllAvailableLeaderboards: GetAvailableLeaderboardsResponse = require("./get_available_leaderboards.json");
const getRecentMatchHistory: GetRecentMatchHistoryResponse = require("./get_recent_match_history?profile_ids=[199325,409748].json");

const leaderboards: { [key: number]: GetLeaderboardResponse } = {};
const leaderboardIds = [1, 2, 3, 4, 5, 13, 14, 15, 16, 17, 18, 25, 26, 27, 28];
for (const leaderboardId of leaderboardIds) {
  leaderboards[
    leaderboardId
  ] = require(`./get_leaderboard?leaderboard_id=${leaderboardId}.json`);
}

export default {
  getAllAvailableLeaderboards,
  getRecentMatchHistory,
  leaderboards,
};
