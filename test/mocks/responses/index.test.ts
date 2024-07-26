import { expect, test } from 'vitest'
import responses from './index';

test('personal stat group id matches stat group id', async () => {
  for(const leaderboard of Object.values(responses.leaderboards)) {
    let mismatch = leaderboard.statGroups.find(statGroup => {
      return statGroup.id !== statGroup.members[0].personal_statgroup_id
    })
    expect(mismatch).toBeUndefined()
  }
})

test('members always has one value', async () => {
  for(const leaderboard of Object.values(responses.leaderboards)) {
    let members = leaderboard.statGroups.reduce((acc, statGroup) => acc + statGroup.members.length, 0)
    expect(members).toEqual(leaderboard.statGroups.length)
  }
})

test('leadboard id is always the one we asked for', async () => {
  for(const [leaderboard_id, leaderboard] of Object.entries(responses.leaderboards)) {
    let mismatch = leaderboard.leaderboardStats.find(stat => stat.leaderboard_id !== parseInt(leaderboard_id))
    expect(mismatch).toBeUndefined()
  }
})

test('leaderboardStats statgroup always exists in statGroups', async () => {
  for(const leaderboard of Object.values(responses.leaderboards)) {
    let statGroupIds = new Set()
    for(const statGroup of leaderboard.statGroups) {
      statGroupIds.add(statGroup.id)
    }
    let missing = leaderboard.leaderboardStats.find(stats => !statGroupIds.has(stats.statgroup_id))
    expect(missing).toBeUndefined()
  }
})