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
import { BoardService } from './board.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly eventsService: EventsService,
    private readonly boardService: BoardService
  ) { }


  // SOCKET | SERVER
  getSocketMap() { return this.server.sockets.sockets }
  getSocketByID(socket_id: string): any { return this.server.sockets.sockets.get(socket_id) }



  // LIFECYCLE HOOK
  handleDisconnect(socket: Socket) {
    console.log(`\nA user has disconnected\nsocket ID: ${socket.id}\n`)
    this.eventsService.setSessionTimeout(socket.id)
    this.eventsService.deletePlayerInQueue(socket.id, null);
  }



  // CONNECTION
  @SubscribeMessage('client_connect')
  clientConnect(@MessageBody() session_id: string, @ConnectedSocket() socket: Socket): any {
    console.log(`\nA new user has connected\n- session ID : ${session_id}\n-  socket ID : ${socket.id}`)
    this.eventsService.handleUserSession(socket, session_id);
  }



  // QUEUE
  @SubscribeMessage('enter_queue')
  async enterQueue(@MessageBody() session_id: string, @ConnectedSocket() socket: Socket): Promise<string> {
    const new_session_id: string = this.eventsService.handleUserSession(socket, session_id)
    const new_match = this.eventsService.handleUserQueue(socket.id, new_session_id)
    if (new_match) {
      const ID1 = new_match.p1.socket_id
      const ID2 = new_match.p2.socket_id
      const p1Socket = this.getSocketByID(ID1)
      const p2Socket = this.getSocketByID(ID2)
      p1Socket.emit('enter_match', this.boardService.getStartingBoard())
      p2Socket.emit('enter_match', this.boardService.getStartingBoard())
    }
    return 'entered queue'
  }

  @SubscribeMessage('exit_queue')
  async exitQueue(@MessageBody() session_id: string, @ConnectedSocket() socket: Socket): Promise<string> {
    this.eventsService.deletePlayerInQueue(socket.id, session_id)
    return 'exited queue'
  }

  }
}
