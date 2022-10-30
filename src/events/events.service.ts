import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { v4 } from 'uuid';

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

    findPlayerInQueueWithSessionId(session_id: string): Player | undefined {
        return this.waiting_queue.find(player => player.session_id === session_id)
    }

    findPlayerInQueueWithSocketId(socket_id: string): Player | undefined {
        return this.waiting_queue.find(player => player.socket_id === socket_id)
    }


    // Update

    updateSocketIdOfSession(socket_id: string, session_id: string) {
        this.findSessionWithSessionId(session_id).socket_id = socket_id;
    }
    updateSessionIdOfSession(socket_id: string, session_id: string) {
        this.findSessionWithSocketId(socket_id).session_id = session_id;
    }
    updateSocketIdOfPlayerInQueue(socket_id: string, session_id: string) {
        this.findPlayerInQueueWithSessionId(session_id).socket_id = socket_id;
    }
    updateSessionIdOfPlayerInQueue(socket_id: string, session_id: string) {
        this.findPlayerInQueueWithSocketId(socket_id).session_id = session_id;
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

    deletePlayerInQueue(socket_id: string, session_id: string) {
        const indexToDelete = this.waiting_queue.findIndex(player => {
            return player.socket_id === socket_id || player.session_id === session_id
        })
        this.waiting_queue.splice(indexToDelete, 1);
    }

    // Handle user's session id

    handleUserSession(socket: Socket, session_id: string): string {
        const found_session: Session | undefined = this.findSessionWithSessionId(session_id)
        const found_socket: Session | undefined = this.findSessionWithSocketId(socket.id)
        const uuid: string = v4();

        if (found_session) {
            console.log('\nUser\'s session ID is in our sessions list\n', found_session)
            this.updateSocketIdOfSession(socket.id, session_id);
            this.clearSessionTimeout(session_id)
            this.findSessionWithSessionId(session_id).timeout = null
            return session_id
        }

        else if (found_socket) {
            console.log(`\nUser\'s socket ID is in our sessions list\n`, found_socket)
            this.updateSessionIdOfSession(socket.id, uuid);
            socket.emit('update_session_id', uuid)
            return uuid
        }

        else {
            console.log('\nUser\'s session ID is not in our session list\n')
            socket.emit('update_session_id', uuid)
            this.addToSessions({ socket_id: socket.id, session_id: uuid, timeout: null })
            return uuid
        }
    }

    handleUserQueue(socket_id: string, session_id: string) {
        if (this.findPlayerInQueueWithSocketId(socket_id)) {
            this.updateSessionIdOfPlayerInQueue(socket_id, session_id); return
        }
        if (this.findPlayerInQueueWithSessionId(session_id)) {
            this.updateSocketIdOfPlayerInQueue(socket_id, session_id); return 
        }
        this.addToQueue({ socket_id: socket_id, session_id: session_id })
    }
}