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
import { Server } from 'socket.io';
import { v4 } from 'uuid';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly eventsService: EventsService) { }

  handleConnection(socket: Socket) {
    const uuid = v4();
    console.log(`Connected with socket ID: ${socket.id}`)
    socket.emit('update_session_id', uuid)
    this.eventsService.saveSession({ socket_id: socket.id, session_id: uuid})
  }
  
  handleDisconnect(socket: Socket) {
    console.log(`Disconnected with socket ID: ${socket.id}`)
  }

  @SubscribeMessage('events')
  findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
    return from([1, 2, 3].map(item => ({ event: 'events', data: item })))
  }

  @SubscribeMessage('cell_click')
  async getCellCoord(@MessageBody() data: any): Promise<string> {
    let num = parseInt(data);
    let row = Math.ceil(num / 8).toString();
    let col = String.fromCharCode('a'.charCodeAt(0) + ((num - 1) % 8));
    return row + col;
  }
}
