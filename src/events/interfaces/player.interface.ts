import { Socket } from "socket.io";
import { Timer } from "./timer.interface";

export interface Player {
    socket: Socket
    session_id: string
    timer: Timer
}