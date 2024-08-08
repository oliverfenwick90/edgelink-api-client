import { expect, test } from "vitest";
import { EdgeLinkApiClient } from "./client";
import responses from "../test/mocks/responses";

test("should get all available leaderboards", async () => {
  const client = new EdgeLinkApiClient();
  const leaderboards = await client.getAvailableLeaderboards();
  expect(leaderboards).toEqual(responses.getAllAvailableLeaderboards);
});

test("should get leaderboard 3", async () => {
  const client = new EdgeLinkApiClient();
  const leaderboard = await client.getLeaderboard(3);
  expect(leaderboard).toEqual(responses.leaderboards[3]);
});

test("should get leaderboard 4", async () => {
  const client = new EdgeLinkApiClient();
  const leaderboard = await client.getLeaderboard(4);
  expect(leaderboard).toEqual(responses.leaderboards[4]);
});

test("should get recent matches", async () => {
  const client = new EdgeLinkApiClient();
  const matches = await client.getRecentMatchHistory([1, 2, 3]);
  expect(matches).toEqual(responses.getRecentMatchHistory);
});
