import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private chatService: ChatService) {}

  afterInit(server: Server) {
    console.log('WebSocket initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message')
  async handleMessage(
    client: Socket,
    data: {
      conversationId: string;
      senderId: string;
      content: string;
      mediaUrl?: string;
    },
  ) {
    try {
      const message = await this.chatService.sendMessage(
        data.conversationId,
        data.senderId,
        data.content,
        data.mediaUrl,
      );
      this.server.to(data.conversationId).emit('newMessage', {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        mediaUrl: message.mediaUrl,
        messageType: message.messageType,
        createdAt: message.createdAt,
      });
    } catch (error) {
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    client: Socket,
    data: { conversationId: string; userId: string; isTyping: boolean },
  ) {
    this.server.to(data.conversationId).emit('userTyping', {
      userId: data.userId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('readReceipt')
  async handleReadReceipt(
    client: Socket,
    data: { conversationId: string; userId: string; messageId: string },
  ) {
    await this.chatService.markAsRead(data.conversationId, data.userId);
    this.server.to(data.conversationId).emit('messageRead', {
      messageId: data.messageId,
      readBy: data.userId,
    });
  }

  @SubscribeMessage('joinConversation')
  handleJoinConversation(client: Socket, data: { conversationId: string; userId: string }) {
    client.join(data.conversationId);
    client.to(data.conversationId).emit('userOnline', {
      userId: data.userId,
      status: 'online',
    });
  }

  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(client: Socket, data: { conversationId: string; userId: string }) {
    client.leave(data.conversationId);
    client.to(data.conversationId).emit('userOnline', {
      userId: data.userId,
      status: 'offline',
    });
  }
}
