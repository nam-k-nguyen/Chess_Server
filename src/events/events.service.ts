import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { v4 } from 'uuid';

import { Session } from './interfaces/session.interface';
import { Match } from './interfaces/match.interface';
import { Player } from './interfaces/player.interface';
import { BoardService } from './board.service';
import { PlayerService } from 'src/player/player.service';

@Injectable()
export class EventsService {
    waiting_queue: Player[] = [];
    sessions: Session[] = [];
    matches: Match[] = [];

    constructor(
        private readonly boardService: BoardService,
        private readonly playerService: PlayerService
    ) { }


    // ADD
    addToQueue(player: Player): void { this.waiting_queue.push(player) }
    addToMatches(player1: Player, player2: Player): Match {
        [player1, player2] = this.playerService.assignRandomColor(player1, player2)
        console.log('player 1', player1)
        console.log('player 2', player2)
        const new_match: Match = {
            p1: player1,
            p2: player2,
            board: this.boardService.getStartingBoard(),
            moves: []
        }
        this.matches.push(new_match)
        return new_match
    }
    addToSessions(session: Session): void { this.sessions.push(session) }



    // GET
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



    // FIND
    findSession(socket_id: string, session_id: string): Session | undefined {
        return this.sessions.find(session => session.socket_id === socket_id || session.session_id === session_id)
    }
    findQueuer(socket_id: string, session_id: string): Player | undefined {
        return this.waiting_queue.find(player => player.socket_id === socket_id || player.session_id === session_id)
    }



    // UPDATE
    updateSession(socket_id: string, session_id: string, target: 'socket' | 'session') {
        if (target === 'socket') this.findSession(null, session_id).socket_id = socket_id;
        if (target === 'session') this.findSession(socket_id, null).session_id = session_id;
    }
    updateQueuer(socket_id: string, session_id: string, target: 'socket' | 'session') {
        if (target === 'socket') this.findQueuer(null, session_id).socket_id = socket_id;
        if (target === 'session') this.findQueuer(socket_id, null).session_id = session_id;
    }



    // TIMEOUT 
    setSessionTimeout(socket_id: string): any {
        console.log(socket_id)
        const foundSession = this.findSession(socket_id, null)
        if (foundSession) {
            foundSession.timeout = setTimeout(() => {
                this.deleteSession(socket_id, null)
            }, 600000)
        }
    }
    clearSessionTimeout(session_id: string): any {
        const foundSession = this.findSession(null, session_id)
        if (foundSession) clearTimeout(foundSession.timeout)
    }



    // DELETE
    deleteSession(socket_id: string, session_id: string) {
        const indexToDelete = this.sessions.findIndex(session => session.socket_id === socket_id || session.session_id === session_id)
        this.sessions.splice(indexToDelete, 1);
    }
    deletePlayerInQueue(socket_id: string, session_id: string) {
        const indexToDelete = this.waiting_queue.findIndex(player => player.socket_id === socket_id || player.session_id === session_id)
        this.waiting_queue.splice(indexToDelete, 1);
    }



    // HANDLER
    handleUserSession(socket: Socket, session_id: string): string {
        const found_session: Session | undefined = this.findSession(null, session_id)
        const found_socket: Session | undefined = this.findSession(socket.id, null)
        const uuid: string = v4();

        if (found_session) {
            console.log('\nUser\'s session ID is in our sessions list\n', found_session)
            this.updateSession(socket.id, session_id, 'socket');
            this.clearSessionTimeout(session_id)
            this.findSession(null, session_id).timeout = null
            return session_id
        }
        else if (found_socket) {
            console.log(`\nUser\'s socket ID is in our sessions list\n`, found_socket)
            this.updateSession(socket.id, uuid, 'session');
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
    handleUserQueue(socket_id: string, session_id: string): null | Match {
        if (this.findQueuer(socket_id, null)) {
            this.updateQueuer(socket_id, session_id, 'session'); return null
        }
        if (this.findQueuer(null, session_id)) {
            this.updateQueuer(socket_id, session_id, 'socket'); return null
        }
        this.addToQueue({ socket_id: socket_id, session_id: session_id })

        if (this.waiting_queue.length === 2) {
            const p1 = this.waiting_queue.shift()
            const p2 = this.waiting_queue.shift()
            return this.addToMatches(p1, p2)
        }
        return null
    }
}