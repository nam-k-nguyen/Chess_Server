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
    const new_session_id = this.eventsService.handleUserSession(socket, session_id);
    const found_match = this.eventsService.findMatch(socket.id, new_session_id)
    if (found_match) {
      socket.emit('update_board', found_match.match.board)
    }
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

  // MATCH
  @SubscribeMessage('verify_move')
  verifyMove(
    @MessageBody() data: { move: { src: number, dest: number }, session_id: string },
    @ConnectedSocket() socket: Socket
  ): string {
    const { move, session_id } = data
    const { src, dest } = move // src and dest are indexes of the board array 
    const result = this.eventsService.findMatch(socket.id, session_id)

    if (!result) { return 'match not found' }
    const {match, player} = result
    const {board, moves} = match
    const { row, col } = board[dest]
    const possible_moves = this.boardService.getPossibleMoves(board, src)
    const current_turn_color = moves.length % 2 === 0 ? 'white' : 'black'
    
    const valid_player = match[player].color === current_turn_color
    if (!valid_player) {return 'invalid player'}
    
    const valid_color = board[src].pieceColor === current_turn_color
    if (!valid_color) {return 'invalid color'}
    
    const valid_move = possible_moves.find(cell => cell.row === row && cell.col === col)
    if (!valid_move) {return 'invalid move'}

    moves.push(this.boardService.getMoveNotation(board, src, dest))
    this.boardService.updateBoard(board, src, dest)
    this.getSocketByID(match.p1.socket_id).emit('update_board', board)
    this.getSocketByID(match.p2.socket_id).emit('update_board', board)

    return 'valid move'
  }

  @SubscribeMessage('update_board')
  async updateBoard(@MessageBody() data: any, @ConnectedSocket() socket: Socket): Promise<any> {
    let { board, session_id } = data
    let result = this.eventsService.findMatch(socket.id, session_id)
    if (result) {
      result.match.board = board
      let other_player = result.player === 'p1' ? 'p2' : 'p1'
      let other_player_socket_id = result.match[other_player].socket_id
      this.getSocketByID(other_player_socket_id).emit('update_board', board)
    }
  }

  @SubscribeMessage('get_possible_moves')
  async getPossibleMoves(@MessageBody() data: any): Promise<any> {
    const {board, index} = data
    return this.boardService.getPossibleMoves(board, index)
  }

  }
}
