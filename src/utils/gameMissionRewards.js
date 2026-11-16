export function getGameMissionRecord(student, questId, missionId) {
  return student?.questProgress?.[questId]?.gameMissions?.[missionId] || null
}

export function hasClaimedGameMissionReward(student, questId, missionId) {
  return Boolean(getGameMissionRecord(student, questId, missionId)?.rewardClaimed)
}

export function buildGameMissionRewardProgress(student, questId, mission, xpEarned, completedAt = new Date().toISOString()) {
  const previousQuest = student?.questProgress?.[questId] || {}
  const previousMissions = previousQuest.gameMissions || {}
  const previousRecord = previousMissions[mission.id] || {}
  const alreadyClaimed = Boolean(previousRecord.rewardClaimed)
  const requestedXP = Number.isFinite(xpEarned) ? Math.max(0, Math.round(xpEarned)) : 0
  const rewardLimit = Number.isFinite(mission.xpReward) ? Math.max(0, Math.round(mission.xpReward)) : 0
  const awardedXP = alreadyClaimed ? 0 : Math.min(requestedXP, rewardLimit)

  return {
    awardedXP,
    alreadyClaimed,
    questProgress: {
      ...(student?.questProgress || {}),
      [questId]: {
        ...previousQuest,
        gameMissions: {
          ...previousMissions,
          [mission.id]: {
            ...previousRecord,
            attempts: (Number(previousRecord.attempts) || 0) + 1,
            rewardClaimed: alreadyClaimed || awardedXP > 0,
            xpAwarded: alreadyClaimed ? (Number(previousRecord.xpAwarded) || 0) : awardedXP,
            lastCompletedAt: completedAt,
          },
        },
      },
    },
  }
}
