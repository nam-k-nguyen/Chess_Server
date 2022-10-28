import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './interfaces/user.interface';

@Injectable()
export class UsersService {
    constructor(@InjectModel('User') private readonly userModel: Model<User>) { }

    async findAll(): Promise<User[]> {
        return await this.userModel.find()
    }

    async findOneById(id: string): Promise<User> {
        return await this.userModel.findOne({ _id: id });
    }

    async findOneByUsername(username: string): Promise<User> {
        return await this.userModel.findOne({ username: username });
    }

    async findOneByUsernameAndPassword(username: string, password: string): Promise<User> {
        return await this.userModel.findOne({ username: username, password: password });
    }

    async create(user: User): Promise<User> {
        const newUser = new this.userModel(user);
        return await newUser.save();
    }

    async delete(id: string): Promise<User> {
        return await this.userModel.findByIdAndRemove(id);
    }

    async update(id: string, user: User): Promise<User> {
        return await this.userModel.findByIdAndUpdate(id, user, { new: true });
    }
}
