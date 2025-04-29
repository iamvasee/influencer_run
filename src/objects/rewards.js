const REWARDS = {
    common: {
        emoji: '🌸',
        points: 10,
        probability: 0.10
    },
    uncommon: {
        emoji: '👙',
        points: 20,
        probability: 0.10
    },
    rare: {
        emoji: '👠',
        points: 30,
        probability: 0.09
    },
    epic: {
        emoji: '💄',
        points: 40,
        probability: 0.09
    },
    legendary: {
        emoji: '🍑',
        points: 50,
        probability: 0.08
    },
    mythic: {
        emoji: '🍒',
        points: 60,
        probability: 0.08
    },
    divine: {
        emoji: '🍆',
        points: 70,
        probability: 0.07
    },
    celestial: {
        emoji: '👅',
        points: 80,
        probability: 0.07
    },
    transcendent: {
        emoji: '💦',
        points: 90,
        probability: 0.06
    },
    ultimate: {
        emoji: '💋',
        points: 100,
        probability: 0.06
    },
    superstar: {
        emoji: '⭐',
        points: 110,
        probability: 0.05
    },
    influencer: {
        emoji: '📸',
        points: 120,
        probability: 0.04
    },
    party: {
        emoji: '🎉',
        points: 130,
        probability: 0.04
    },
    city: {
        emoji: '🌆',
        points: 140,
        probability: 0.03
    },
    fashion: {
        emoji: '👜',
        points: 150,
        probability: 0.03
    },
    shades: {
        emoji: '🕶️',
        points: 160,
        probability: 0.02
    },
    lipstick: {
        emoji: '💋',
        points: 170,
        probability: 0.02
    },
    diamond: {
        emoji: '💎',
        points: 200,
        probability: 0.01
    }
};

// Make REWARDS available globally
window.REWARDS = REWARDS;

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