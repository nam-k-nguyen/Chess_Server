import { Injectable } from '@nestjs/common';
import { Player } from 'src/events/interfaces/player.interface';
import { stopwatch } from 'durations'

@Injectable()
export class PlayerService {
    player(): string {
        return 'player service'
    }

    assignRandomColor(p1: Player, p2: Player): Player[] {
        let rand = Math.random() > 0.5
        p1.color = rand ? 'black' : 'white'
        p2.color = rand ? 'white' : 'black'
        return [p1, p2]
    }

    assignTimer(p1: Player, p2: Player): Player[] {
        const timer1 = stopwatch()
        const timer2 = stopwatch()
        p1.timer = timer1
        p2.timer = timer2
        return [p1, p2]
    }

    preparePlayer(p1: Player, p2: Player): Player[] {
        let colored = this.assignRandomColor(p1, p2)
        let timered = this.assignTimer(colored[0], colored[1])
        return timered
    }
}
