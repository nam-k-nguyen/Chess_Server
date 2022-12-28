import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { EventsService } from './events.service';
import { BoardService } from './board.service';
import { PlayerModule } from 'src/player/player.module';

@Module({
  imports: [PlayerModule  ],
  providers: [EventsGateway, EventsService, BoardService],

})
export class EventsModule {}
