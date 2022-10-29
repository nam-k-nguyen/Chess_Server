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

    // Find

    findSessionWithSessionId(session_id: string): Session | undefined {
        return this.sessions.find(session => session.session_id === session_id)
    }

    findSessionWithSocketId(socket_id: string): Session | undefined {
        return this.sessions.find(session => session.socket_id === socket_id)
    }

    // Update

    updateSocketId(socket_id: string, session_id: string) {
        this.findSessionWithSessionId(session_id).socket_id = socket_id;
    }

    // When a socket is disconnected: Set time out to delete a session after 10 minutes 
    setSessionTimeout(socket_id: string): any {
        console.log(socket_id)
        const foundSession = this.findSessionWithSocketId(socket_id)
        if (foundSession) {
            foundSession.timeout = setTimeout(() => {
                this.deleteSession(socket_id, null)
            }, 600000)
        }
    }

    clearSessionTimeout(session_id: string): any {
        const foundSession = this.findSessionWithSessionId(session_id)
        if (foundSession) clearTimeout(foundSession.timeout)
    }

    // Delete

    deleteSession(socket_id: string, session_id: string) {
        const indexToDelete = this.sessions.findIndex(session => {
            return session.socket_id === socket_id || session.session_id === session_id
        })
        this.sessions.splice(indexToDelete, 1);
    }
}