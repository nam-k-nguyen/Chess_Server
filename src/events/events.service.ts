import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

import { Session } from './interfaces/session.interface';
import { Match } from './interfaces/match.interface';
import { Player } from './interfaces/player.interface';

@Injectable()
export class EventsService {
    waiting_queue: Player[] = [];
    sessions: Session[] = [];
    matches: Match[] = [];

    // Setter

    addToQueue(player: Player): string {
        let new_length = this.waiting_queue.push(player)
        return new_length > 0 ? 'added to queue' : 'not added to queue'
    }
    addToMatches() { }
    addToSessions(session: Session): void { this.sessions.push(session) }

    // Getter

    getQueue(): Array<Player> { return this.waiting_queue }
    getMatches(): Array<Match> { return this.matches }
    getSessions(): Array<Session> { return this.sessions }
    getPrintableSessions(): Array<object> {
        return this.sessions.map(session => ({
            socket_id: session.socket_id,
            session_id: session.session_id,
            timeout: session.timeout === null ? null : {
                purpose: `this timeout is counting down to delete this session since the associated user has disconnected`
            }
        }))
    }
}