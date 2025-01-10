// Common rank patterns and their colors
const RANK_PATTERNS = [
    // Numbered Tiers (e.g., "Diamond 2", "Gold 3")
    {
        pattern: /^(Iron|Bronze|Silver|Gold|Platinum|Diamond|Master|Grandmaster|Challenger)\s*\d*/i,
        getColor: (rank: string) => {
            const tier = rank.split(/\s+/)[0].toLowerCase();
            switch (tier) {
                case 'iron': return 'text-gray-400';
                case 'bronze': return 'text-amber-600';
                case 'silver': return 'text-gray-300';
                case 'gold': return 'text-yellow-500';
                case 'platinum': return 'text-cyan-300';
                case 'diamond': return 'text-blue-400';
                case 'master': return 'text-purple-500';
                case 'grandmaster': return 'text-red-500';
                case 'challenger': return 'text-purple-600';
                default: return 'text-gray-400';
            }
        }
    },
    // CS:GO/Valorant Style
    {
        pattern: /^(Silver|Gold|Master|Global|Immortal|Radiant|Elite)/i,
        getColor: (rank: string) => {
            const tier = rank.toLowerCase();
            if (tier.includes('silver')) return 'text-gray-300';
            if (tier.includes('gold')) return 'text-yellow-500';
            if (tier.includes('master')) return 'text-purple-500';
            if (tier.includes('global')) return 'text-yellow-400';
            if (tier.includes('immortal')) return 'text-red-500';
            if (tier.includes('radiant')) return 'text-cyan-400';
            if (tier.includes('elite')) return 'text-yellow-400';
            return 'text-gray-400';
        }
    },
    // Numbered Ranks (e.g., "Top 500", "Rank 1")
    {
        pattern: /^(Top|Rank)\s*\d+/i,
        getColor: (rank: string) => {
            const number = parseInt(rank.match(/\d+/)?.[0] || '0');
            if (number <= 10) return 'text-red-500';
            if (number <= 100) return 'text-purple-500';
            if (number <= 500) return 'text-blue-400';
            return 'text-cyan-300';
        }
    },
    // Letter Grades (e.g., "S+", "A-")
    {
        pattern: /^[SABCDEF][+-]?$/i,
        getColor: (rank: string) => {
            const grade = rank.toUpperCase().charAt(0);
            switch (grade) {
                case 'S': return 'text-yellow-400';
                case 'A': return 'text-red-500';
                case 'B': return 'text-purple-500';
                case 'C': return 'text-blue-400';
                case 'D': return 'text-green-500';
                case 'F': return 'text-gray-400';
                default: return 'text-gray-400';
            }
        }
    }
];

export const getRankColor = (rank: string): string => {
    let rankLower = rank.toLowerCase();

    // Common shorthand mappings
    const shorthandMap: { [key: string]: string } = {
        'plat': 'platinum',
        'dia': 'diamond',
        'champ': 'champion',
        'gm': 'grandmaster',
        'gc': 'grand champion',
        'imm': 'immortal',
        'rad': 'radiant',
        'silv': 'silver',
        'mas': 'master',
        'leg': 'legend',
        'br': 'bronze',
        // Overwatch specific
        'top500': 'top 500',
        't500': 'top 500'
    };

    // Check if the rank starts with any shorthand
    for (const [short, full] of Object.entries(shorthandMap)) {
        if (rankLower.startsWith(short)) {
            rankLower = rankLower.replace(short, full);
            break;
        }
    }

    // Check for Overwatch SR numbers
    const srMatch = rankLower.match(/\d+/);
    if (srMatch) {
        const sr = parseInt(srMatch[0]);
        if (sr >= 4900) return 'text-yellow-300'; // Top 500
        if (sr >= 4000) return 'text-orange-500'; // Grandmaster
        if (sr >= 3500) return 'text-purple-500'; // Master
        if (sr >= 3000) return 'text-cyan-400';   // Diamond
        if (sr >= 2500) return 'text-blue-400';   // Platinum
        if (sr >= 2000) return 'text-yellow-500'; // Gold
        if (sr >= 1500) return 'text-gray-400';   // Silver
        if (sr >= 1) return 'text-orange-700';    // Bronze
    }

    // Check for Overwatch text ranks
    if (rankLower.includes('top 500') || rankLower.includes('top500') || rankLower.includes('t500')) {
        return 'text-yellow-300';
    }

    if (rankLower.includes('iron') || rankLower.includes('bronze')) {
        return 'text-orange-700';
    } else if (rankLower.includes('silver')) {
        return 'text-gray-400';
    } else if (rankLower.includes('gold')) {
        return 'text-yellow-500';
    } else if (rankLower.includes('platinum') || rankLower.includes('plat')) {
        return 'text-cyan-400';
    } else if (rankLower.includes('diamond') || rankLower.includes('dia')) {
        return 'text-blue-400';
    } else if (rankLower.includes('ascendant')) {
        return 'text-green-400';
    } else if (rankLower.includes('immortal') || rankLower.includes('imm')) {
        return 'text-red-400';
    } else if (rankLower.includes('radiant') || rankLower.includes('rad')) {
        return 'text-yellow-300';
    } else if (rankLower.includes('champion') || rankLower.includes('champ')) {
        return 'text-purple-400';
    } else if (rankLower.includes('grand champion') || rankLower.includes('gc')) {
        return 'text-red-500';
    } else if (rankLower.includes('master') || rankLower.includes('mas')) {
        return 'text-purple-500';
    } else if (rankLower.includes('grandmaster') || rankLower.includes('gm')) {
        return 'text-orange-500'; // Changed to match Overwatch GM color
    } else if (rankLower.includes('legend') || rankLower.includes('leg')) {
        return 'text-yellow-600';
    }
    
    return 'text-white';
};

// Use the same shorthand mappings for peak rank colors
export const getPeakRankColor = (rank: string): string => {
    let rankLower = rank.toLowerCase();

    // Common shorthand mappings (same as above)
    const shorthandMap: { [key: string]: string } = {
        'plat': 'platinum',
        'dia': 'diamond',
        'champ': 'champion',
        'gm': 'grandmaster',
        'gc': 'grand champion',
        'imm': 'immortal',
        'rad': 'radiant',
        'silv': 'silver',
        'mas': 'master',
        'leg': 'legend',
        'br': 'bronze'
    };

    // Check if the rank starts with any shorthand
    for (const [short, full] of Object.entries(shorthandMap)) {
        if (rankLower.startsWith(short)) {
            rankLower = rankLower.replace(short, full);
            break;
        }
    }

    // Add a golden glow effect to peak ranks
    const baseColor = getRankColor(rank);
    return `${baseColor} drop-shadow-[0_0_2px_rgba(255,215,0,0.5)]`;
}; 