import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Match } from './interfaces/match.interface';

@Injectable()
export class EventsService {
    waiting_queue = [];
    matches: Match[] = [];
    
    getQueue(): Array<object> {return this.waiting_queue}
    getMatches(): Array<object> {return this.matches}
}