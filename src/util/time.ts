export function getNowTimestamp(): number {
    const now = new Date();
    const timestampSeconds = Math.floor(now.getTime() / 1000); // Convert milliseconds to seconds
    return timestampSeconds;
}

export function calcAverageBlockTime(timestamps: number[]): number {
    if (timestamps.length === 0) {
        return 0;
    }

    // every timestamp is the time when a block is produced
    // so the average time between two blocks is the average block time
    const timeDiffs = [];
    for (let i = 1; i < timestamps.length; i++) {
        timeDiffs.push(timestamps[i - 1] - timestamps[i]);
    }
    const averageTimeDiff =
        timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
    return Number.parseFloat((averageTimeDiff / 1000).toFixed(2));
}
