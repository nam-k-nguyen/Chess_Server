import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { EventsService } from './events.service';
import { BoardService } from './board.service';

@Module({
  providers: [EventsGateway, EventsService, BoardService],

})
export class EventsModule {}
