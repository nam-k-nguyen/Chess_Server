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
    console.log(`Disconnected with socket ID: ${socket.id}`)
  }

  // Custom events
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
