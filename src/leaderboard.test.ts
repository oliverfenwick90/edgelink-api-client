import { expect, test } from 'vitest'
import { Leaderboard } from './leaderboard'
import responses from '../test/mocks/responses';

test('profileIds() returns unique set of profile ids', async () => {
  for(const [leaderboardId, leaderboardResponse] of Object.entries(responses.leaderboards)) {
    let leaderboard = new Leaderboard(parseInt(leaderboardId), leaderboardResponse)

    let idSet = new Set<number>;
    let expectedProfileIds = new Array<number>();
    for(const stat of leaderboardResponse.statGroups) {
      let profileId = stat.members[0].profile_id;

      if(!idSet.has(profileId)) {
        idSet.add(profileId);
        expectedProfileIds.push(profileId)
      }
    }

    let profileIds = leaderboard.profileIds()
    expect(profileIds).toEqual(expectedProfileIds)
  }
})