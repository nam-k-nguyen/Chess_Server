import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { User } from './interfaces/user.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Post('signin')
  async signin(@Body() createUserDto: CreateUserDto): Promise<boolean> {
    return this.usersService.findOneByUsernameAndPassword(createUserDto.username, createUserDto.password).then(user => {
      return user ? true : false
    })
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<boolean> {
    return this.usersService.findOneByUsername(createUserDto.username).then(user => {
      if (user) { return false; }
      else {
        this.usersService.create({
          username: createUserDto.username,
          password: createUserDto.password,
          elo: '0',
          win: '0',
          lose: '0'
        })
        return true;
      }
    })
  }

  @Post('info')
  async get(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.findOneByUsername(createUserDto.username).then(user => {
      return {
        username: user.username,
        elo: user.elo,
        win: user.win,
        lose: user.lose
      }
    })
  }

  //   @Get(':id')
  //   findOne(@Param('id') id): Promise<User> {
  //     return this.usersService.findOneById(id);
  //   }

  @Post('create')
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  //   @Delete(':id')
  //   delete(@Param('id') id): Promise<User> {
  //     return this.usersService.delete(id);
  //   }

  //   @Put(':id')
  //   update(@Body() updateUserDto: CreateUserDto, @Param('id') id): Promise<User> {
  //     return this.usersService.update(id, updateUserDto);
  //   }
}
