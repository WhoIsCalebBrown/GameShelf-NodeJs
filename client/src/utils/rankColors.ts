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

    // Check for letter grades
    const letterGradeMatch = rankLower.match(/^([sabcdf])([+-])?$/i);
    if (letterGradeMatch) {
        const grade = letterGradeMatch[1].toUpperCase();
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