export interface Session {
    socket_id: string
    session_id: string
    timeout: ReturnType<typeof setTimeout> | null
}