export interface Timer {
    second: number,
    interval: ReturnType<typeof setInterval> | null
}