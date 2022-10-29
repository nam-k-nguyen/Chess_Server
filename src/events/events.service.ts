import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Match } from './interfaces/match.interface';
import { Player } from './interfaces/player.interface';

@Injectable()
export class EventsService {
    waiting_queue: Player[] = [];
    sessions: Player[] = [];
    matches: Match[] = [];
    
    getQueue(): Array<object> {return this.waiting_queue}
    getMatches(): Array<object> {return this.matches}
}