import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { EventsService } from './events.service';
// import { Server } from 'socket.io';


@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  // @WebSocketServer()
  // server: Server;
  constructor(private readonly eventsService: EventsService) { }

  @SubscribeMessage('events')
  findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
    // These 2 return statements are the same, but mine is cleaner
    return from([1, 2, 3].map(item => ({ event: 'events', data: item })))
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    return data;
  }

  @SubscribeMessage('cell_click')
  async getCellCoord(@MessageBody() data: any): Promise<string> {
    let num = parseInt(data);
    let row = Math.ceil(num / 8).toString();
    let col = String.fromCharCode('a'.charCodeAt(0) + ((num - 1) % 8));
    return row + col;
  }

  @SubscribeMessage('find_match')
  findMatch(@MessageBody() username: string, @ConnectedSocket() client: Socket): string {
    this.eventsService.addToQueue(username, client)

    console.log('queue (in find_match):', this.eventsService.getQueue())
    console.log('client id (in find match): ', client.id)

    return 'finding a user for you...';
  }

  @SubscribeMessage('xo_click')
  makeMove(
    @MessageBody() data: { username: string, opponent_username: string, row: number, column: number }, @ConnectedSocket() client: Socket): any {

    console.log('xo click data', data)
    let match = this.eventsService.findMatchWithTwoUsername(data.username, data.opponent_username)

    console.log('match in xo_click', match)
    if (match !== undefined) {
      console.log('inside xo_click', match)
      if (match.p1.username === data.opponent_username) { match.p1.socket.emit('opponent_xo_click', { username: data.username, row: data.row, col: data.column }) }
      if (match.p2.username === data.opponent_username) { match.p2.socket.emit('opponent_xo_click', { username: data.username, row: data.row, col: data.column }) }
    }
  }
}
