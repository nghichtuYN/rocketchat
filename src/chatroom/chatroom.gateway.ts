import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { Message } from '../messages/messages.schema';

@Injectable()
@WebSocketGateway({ cors: { origin: '*' } })
export class ChatroomGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private connectedUsers: Map<string, string> = new Map();

  handleConnection(client: Socket) {
    // console.log(this.server.engine);
    console.log(`Client connected: ${client.id}`);
  }

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.connectedUsers.delete(client.id);
    client.disconnect();
  }

  getClientIdByUserId(userId: string): string | undefined {
    for (const [clientId, storedUserId] of this.connectedUsers.entries()) {
      if (storedUserId === userId) {
        return clientId;
      }
    }
    return undefined;
  }

  @SubscribeMessage('join')
  handleJoinRoom(client: Socket, payload) {
    // const data = JSON.parse(payload);
    console.log(payload);
    this.connectedUsers.set(client.id, payload.userId);
    client.join(payload.roomId);
    console.log(`User ${payload.userId} joined room ${payload.roomId}`);

    client.to(payload.roomId).emit('joinedRoom', {
      message: `User ${payload.userId} has joined the room`,
      userId: payload.userId,
      roomId: payload.roomId,
    });
  }

  @SubscribeMessage('newMessage')
  handleNewMessage(client: Socket, payload: Message) {
    console.log(payload);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, payload: { roomId: string }) {
    client.leave(payload.roomId);
    console.log(`Client ${client.id} left room ${payload.roomId}`);
  }

  syncDataToRoom(clientId: string, roomId: string, event: string, data: any) {
    const socket = this.server.sockets.sockets.get(clientId);
    this.server.to(roomId).emit(event, data);
  }
}
