import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';

import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    MongooseModule.forRoot(`mongodb+srv://nam-k-nguyen:makeuc2022@tictactoe.1dlsdv0.mongodb.net/?retryWrites=true&w=majority`),
    EventsModule,
    UsersModule,
  ],
  controllers: [AppController, UsersController],
  providers: [AppService, UsersService]
})
export class AppModule {}
