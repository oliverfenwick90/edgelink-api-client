import { http, HttpResponse } from 'msw';

const getAllAvailableLeaderboards = require("./responses/get_available_leaderboards.json");
const getLeaderboardThree = require("./responses/get_leaderboard?leaderboard_id=3.json");
const getLeaderboardFour = require( "./responses/get_leaderboard?leaderboard_id=4.json");
const getRecentMatchHistory = require("./responses/get_recent_match_history?profile_ids=[199325,409748].json");

export const handlers = [
  http.get('https://aoe-api.worldsedgelink.com/community/leaderboard/getAvailableLeaderboards', () => {
    return HttpResponse.json(getAllAvailableLeaderboards)
  }),
  http.get('https://aoe-api.worldsedgelink.com/community/leaderboard/getLeaderBoard2', (req) => {
    const url = new URL(req.request.url)
    if(url === null) {
      return HttpResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }
    const leaderboardId = url.searchParams.get('leaderboard_id');
    if(leaderboardId === "3") {
      return HttpResponse.json(getLeaderboardThree)
    } else if(leaderboardId === "4") {
      return HttpResponse.json(getLeaderboardFour)
    } else {
      return HttpResponse.json(getLeaderboardFour)
    }
  }),
  http.get('https://aoe-api.worldsedgelink.com/community/leaderboard/getRecentMatchHistory', () => {
    return HttpResponse.json(getRecentMatchHistory)
  }),
];