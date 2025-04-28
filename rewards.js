const REWARDS = {
    common: {
        emoji: '🌸',
        points: 10,
        probability: 0.15
    },
    uncommon: {
        emoji: '👙',
        points: 20,
        probability: 0.15
    },
    rare: {
        emoji: '👠',
        points: 30,
        probability: 0.12
    },
    epic: {
        emoji: '💄',
        points: 40,
        probability: 0.12
    },
    legendary: {
        emoji: '🍑',
        points: 50,
        probability: 0.10
    },
    mythic: {
        emoji: '🍒',
        points: 60,
        probability: 0.10
    },
    divine: {
        emoji: '🍆',
        points: 70,
        probability: 0.08
    },
    celestial: {
        emoji: '👅',
        points: 80,
        probability: 0.08
    },
    transcendent: {
        emoji: '💦',
        points: 90,
        probability: 0.05
    },
    ultimate: {
        emoji: '💋',
        points: 100,
        probability: 0.05
    }
};

// Helper function to get random reward based on probability
function getRandomReward() {
    const rand = Math.random();
    let cumulativeProbability = 0;
    
    for (const [type, reward] of Object.entries(REWARDS)) {
        cumulativeProbability += reward.probability;
        if (rand <= cumulativeProbability) {
            return {
                type,
                ...reward
            };
        }
    }
    
    return REWARDS.common; // Fallback to common reward
} 