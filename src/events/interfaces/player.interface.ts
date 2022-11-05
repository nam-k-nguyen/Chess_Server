import {stopwatch} from 'durations'

export interface Player {
    socket_id: string
    session_id: string
    color?: 'black' | 'white'
    timer?: ReturnType<typeof stopwatch> | null
}