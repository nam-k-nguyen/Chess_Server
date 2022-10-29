import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Match } from './interfaces/match.interface';
import { Player } from './interfaces/player.interface';

@Injectable()
export class EventsService {
    waiting_queue: Player[] = [];
    sessions: Player[] = [];
    matches: Match[] = [];

    // Setter

    addToQueue(player: Player): string {
        let new_length = this.waiting_queue.push(player)
        return new_length > 0 ? 'added to queue' : 'not added to queue'
    }
    addToMatches() { }
    addToSessions(player: Player): any {
        this.sessions.push(player);
    }

    // Getter

    getQueue(): Array<Player> { return this.waiting_queue }
    getMatches(): Array<Match> { return this.matches }
    getSessions(): Array<Player> { return this.sessions }
}