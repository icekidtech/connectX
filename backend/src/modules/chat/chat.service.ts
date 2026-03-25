import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { MessageRead } from './entities/message-read.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(MessageRead)
    private messageReadRepository: Repository<MessageRead>,
  ) {}

  async getConversations(userId: string) {
    return await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participants', 'participants')
      .leftJoinAndSelect('participants.profile', 'profile')
      .leftJoinAndSelect('conversation.messages', 'messages', 'messages.createdAt = (SELECT MAX(m.createdAt) FROM message m WHERE m.conversationId = conversation.id)')
      .where(':userId IN (SELECT p.id FROM conversation_participants cp JOIN user p ON cp.participantId = p.id WHERE cp.conversationId = conversation.id)', { userId })
      .orderBy('conversation.updatedAt', 'DESC')
      .getMany();
  }

  async getOrCreateConversation(userIds: string[]) {
    const sortedUserIds = userIds.sort();

    // Check if conversation exists
    let conversation = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participants', 'participants')
      .where('conversation.type = :type', { type: 'direct' })
      .andWhere('(SELECT COUNT(*) FROM conversation_participants WHERE conversationId = conversation.id AND participantId IN (:...userIds)) = :count', {
        userIds: sortedUserIds,
        count: sortedUserIds.length,
      })
      .getOne();

    if (!conversation) {
      conversation = this.conversationRepository.create({
        type: 'direct',
        participants: sortedUserIds.map((id) => ({ id })),
      });
      await this.conversationRepository.save(conversation);
    }

    return conversation;
  }

  async getConversation(conversationId: string, userId: string) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants', 'participants.profile'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Check if user is participant
    const isParticipant = conversation.participants.some((p) => p.id === userId);
    if (!isParticipant) {
      throw new Error('Unauthorized');
    }

    return conversation;
  }

  async getMessages(conversationId: string, userId: string, page: number = 1, limit: number = 50) {
    await this.getConversation(conversationId, userId);

    const messages = await this.messageRepository.find({
      where: { conversationId },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['sender', 'sender.profile'],
      order: { createdAt: 'DESC' },
    });

    return messages.reverse();
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    mediaUrl?: string,
  ) {
    const conversation = await this.getConversation(conversationId, senderId);

    const message = this.messageRepository.create({
      conversationId,
      senderId,
      content,
      mediaUrl,
      messageType: mediaUrl ? 'media' : 'text',
    });

    await this.messageRepository.save(message);

    // Update conversation lastMessage
    conversation.updatedAt = new Date();
    await this.conversationRepository.save(conversation);

    return message;
  }

  async markAsRead(conversationId: string, userId: string) {
    // Get all unread messages in conversation not from this user
    const unreadMessages = await this.messageRepository.find({
      where: { conversationId },
      relations: ['messageReads'],
    });

    for (const message of unreadMessages) {
      if (message.senderId === userId) continue;

      const existingRead = await this.messageReadRepository.findOne({
        where: { messageId: message.id, userId },
      });

      if (!existingRead) {
        const read = this.messageReadRepository.create({
          messageId: message.id,
          userId,
        });
        await this.messageReadRepository.save(read);
      }
    }

    return { success: true };
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new Error('Unauthorized');
    }

    await this.messageRepository.delete(messageId);
    return { success: true };
  }

  async getTypingUsers(conversationId: string) {
    // This will be managed by WebSocket gateway
    return [];
  }
}
