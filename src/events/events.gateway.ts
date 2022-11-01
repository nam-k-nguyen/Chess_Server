import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { EventsService } from './events.service';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly eventsService: EventsService) { }

  // Lifecycle hooks interface

  handleDisconnect(socket: Socket) {
    console.log(`\nA user has disconnected\nsocket ID: ${socket.id}\n`)
    this.eventsService.setSessionTimeout(socket.id)
    this.eventsService.deletePlayerInQueue(socket.id, null);
  }

  // Custom events

  @SubscribeMessage('client_connect')
  clientConnect(@MessageBody() session_id: string, @ConnectedSocket() socket: Socket): any {
    console.log(`\nA new user has connected\n- session ID : ${session_id}\n-  socket ID : ${socket.id}`)
    this.eventsService.handleUserSession(socket, session_id);
  }

  @SubscribeMessage('cell_click')
  async getCellCoord(@MessageBody() data: any): Promise<string> {
    let num = parseInt(data);
    let row = Math.ceil(num / 8).toString();
    let col = String.fromCharCode('a'.charCodeAt(0) + ((num - 1) % 8));
    return row + col;
  }

  @SubscribeMessage('enter_queue')
  async enterQueue(@MessageBody() session_id: string, @ConnectedSocket() socket: Socket): Promise<string> {
    const new_session_id: string = this.eventsService.handleUserSession(socket, session_id)
    this.eventsService.handleUserQueue(socket.id, new_session_id)
    return 'entered queue'
  }

  @SubscribeMessage('exit_queue')
  async exitQueue(@MessageBody() session_id: string, @ConnectedSocket() socket: Socket): Promise<string> {
    this.eventsService.deletePlayerInQueue(socket.id, session_id)
    return 'exited queue'
  }

  }
}
