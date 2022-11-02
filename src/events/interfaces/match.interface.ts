import { Player } from "./player.interface"
import { Cell } from "./cell.interface"

export interface Match {
    p1: Player
    p2: Player
    board?: Cell[]
}