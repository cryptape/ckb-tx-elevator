export function getNowTimestamp(): number {
    const now = new Date();
    const timestampSeconds = Math.floor(now.getTime() / 1000); // Convert milliseconds to seconds
    return timestampSeconds;
}
