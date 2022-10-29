import { Socket } from "socket.io";
import { Timer } from "./timer.interface";

export interface Player {
    socket_id: string
    session_id: string
    timer?: Timer
}