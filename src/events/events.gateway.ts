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
import { v4 } from 'uuid';
import { Session } from './interfaces/session.interface';

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
  }

  // Custom events

  @SubscribeMessage('client_connect')
  clientConnect(@MessageBody() session_id: string, @ConnectedSocket() socket: Socket): any {
    console.log(`\nA new user has connected\n- session ID : ${session_id}\n-  socket ID : ${socket.id}`)

    const found_session: Session | undefined = this.eventsService.findSessionWithSessionId(session_id)
    const uuid: string = v4();

    if (found_session) { // If client has a session ID that is in our sessions list
      console.log('\nUser\'s session ID is in our sessions list\n', found_session)
      this.eventsService.updateSocketId(socket.id, session_id);
      this.eventsService.clearSessionTimeout(session_id)
      this.eventsService.findSessionWithSessionId(session_id).timeout = null
    }
    else { // If client has a session ID that is NOT in our sessions list
      console.log('\nUser\'s session ID is not in our session list\n')
      socket.emit('update_session_id', uuid)
      this.eventsService.addToSessions({ socket_id: socket.id, session_id: uuid, timeout: null })
    }
  }

  @SubscribeMessage('cell_click')
  async getCellCoord(@MessageBody() data: any): Promise<string> {
    let num = parseInt(data);
    let row = Math.ceil(num / 8).toString();
    let col = String.fromCharCode('a'.charCodeAt(0) + ((num - 1) % 8));
    return row + col;
  }

  @SubscribeMessage('quick_match')
  async quickMatch(@MessageBody() data: any, @ConnectedSocket() socket: Socket): Promise<string> {
    const uuid = v4();
    this.eventsService.addToQueue({ socket_id: socket.id, session_id: uuid })
    return 'received'
  }
}
