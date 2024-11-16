export function formatTime(timeInSecs) {
    const mins = Math.floor(timeInSecs / 60);
    const secs = timeInSecs % 60;

    return `${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
}