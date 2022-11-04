import { Injectable } from '@nestjs/common';
import { Player } from 'src/events/interfaces/player.interface';

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
}
