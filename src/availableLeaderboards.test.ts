import { expect, test } from 'vitest'
import { AvailableLeaderboards } from './availableLeaderboards'

test('matchtype id always belongs to a single leaderboard', async () => {
  const availableLeaderboards = await AvailableLeaderboards.get()

  const seenMatchTypeIds = new Set<number>();

  for(const leaderboardId of availableLeaderboards.getLeaderboardIds()) {
    for(const matchTypeId of availableLeaderboards.getMatchTypeIds(leaderboardId)) {
      expect(seenMatchTypeIds.has(matchTypeId)).toBe(false)
      seenMatchTypeIds.add(matchTypeId)
    }
  }
})