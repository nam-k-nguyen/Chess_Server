import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class EventsService {
    waiting_queue = [];
    matches = [];

    addToQueue(username: string, socket: Socket): void {
        // Add user to queue if it's empty 
        if (this.waiting_queue.length === 0) {this.waiting_queue.push({ username, socket })}
        // If not match new user with queueing user 
        else {
            // Remove queue user from queue
            let queue_user = this.waiting_queue.shift();
            let queue_username = queue_user.username
            let queue_socket = queue_user.socket
            // Add both users to match list
            this.addToMatches(username, socket, queue_username, queue_socket)

            console.log('matches in add to queue', this.matches)

            socket.emit('match_found', queue_username)
            queue_socket.emit('match_found', username)
        }
    }

    addToMatches(username1: string, socket1: Socket, username2: string, socket2: Socket): any {
        let matchExisted = this.findMatchWithTwoUsername(username1, username2);
        if (!matchExisted) {
            this.matches.push({
                p1: { username: username1, socket: socket1 },
                p2: { username: username2, socket: socket2 }
            })
        }
        console.log('matches in add to matches', this.matches)
    }

    // Find a match that has this username
    findMatchWithOneUsername(username: string) {
        return this.matches.find(match => {
            return [match.p1.username, match.p2.username].includes(username) 
        })
    }
    
    // Find a match that has these 2 usernames
    findMatchWithTwoUsername(username1: string, username2: string): any {
        console.log('find match with 2 usernames    ', username1, username2)
        console.log(this.matches)
        return this.matches.find(match => {
            return (
                [match.p1.username, match.p2.username].includes(username1) &&
                [match.p1.username, match.p2.username].includes(username2)
            )
        })
    }

    getQueue(): Array<object> {
        return this.waiting_queue
    }

    getMatches(): Array<object> {
        return this.matches
    }
}