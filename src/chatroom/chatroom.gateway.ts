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
  handleJoinRoom(client: Socket, payload: string) {
    const data = JSON.parse(payload);
    this.connectedUsers.set(client.id, data.userId);
    client.join(data.roomId);
    console.log(this.server.engine);
    console.log(`User ${data.userId} joined room ${data.roomId}`);

    client.to(data.roomId).emit('joinedRoom', {
      message: `User ${data.userId} has joined the room`,
      userId: data.userId,
      roomId: data.roomId,
    });
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, payload: { roomId: string }) {
    client.leave(payload.roomId);
    console.log(`Client ${client.id} left room ${payload.roomId}`);
  }

  syncDataToRoom(clientId: string, roomId: string, event: string, data: any) {
    const socket = this.server.sockets.sockets.get(clientId);
    socket.to(roomId).emit(event, data);
  }
}
