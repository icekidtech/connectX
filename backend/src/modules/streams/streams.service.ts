import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stream } from './entities/stream.entity';
import { StreamViewer } from './entities/stream-viewer.entity';

@Injectable()
export class StreamsService {
  constructor(
    @InjectRepository(Stream)
    private streamRepository: Repository<Stream>,
    @InjectRepository(StreamViewer)
    private streamViewerRepository: Repository<StreamViewer>,
  ) {}

  async startStream(broadcasterId: string, title: string, description?: string, isNsfw: boolean = false) {
    const stream = this.streamRepository.create({
      broadcasterId,
      title,
      description,
      isNsfw,
      status: 'live',
      streamKey: this.generateStreamKey(),
      viewerCount: 0,
    });

    return await this.streamRepository.save(stream);
  }

  async getLiveStreams(page: number = 1, limit: number = 20) {
    return await this.streamRepository.find({
      where: { status: 'live' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['broadcaster', 'broadcaster.profile'],
      order: { viewerCount: 'DESC' },
    });
  }

  async getStreamById(streamId: string) {
    const stream = await this.streamRepository.findOne({
      where: { id: streamId },
      relations: ['broadcaster', 'broadcaster.profile', 'viewers'],
    });

    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    return stream;
  }

  async getBroadcasterStreams(broadcasterId: string) {
    return await this.streamRepository.find({
      where: { broadcasterId },
      relations: ['viewers'],
      order: { createdAt: 'DESC' },
    });
  }

  async endStream(streamId: string, broadcasterId: string) {
    const stream = await this.getStreamById(streamId);

    if (stream.broadcasterId !== broadcasterId) {
      throw new Error('Unauthorized to end this stream');
    }

    stream.status = 'ended';
    stream.endedAt = new Date();

    return await this.streamRepository.save(stream);
  }

  async joinStream(streamId: string, viewerId: string) {
    const stream = await this.getStreamById(streamId);

    // Check if already viewing
    const existingViewer = await this.streamViewerRepository.findOne({
      where: { streamId, viewerId },
    });

    if (!existingViewer) {
      const viewer = this.streamViewerRepository.create({
        streamId,
        viewerId,
      });
      await this.streamViewerRepository.save(viewer);

      // Increment viewer count
      stream.viewerCount = (stream.viewerCount || 0) + 1;
      await this.streamRepository.save(stream);
    }

    return stream;
  }

  async leaveStream(streamId: string, viewerId: string) {
    const stream = await this.getStreamById(streamId);

    await this.streamViewerRepository.delete({
      streamId,
      viewerId,
    });

    // Decrement viewer count
    stream.viewerCount = Math.max(0, (stream.viewerCount || 1) - 1);
    await this.streamRepository.save(stream);

    return stream;
  }

  async getStreamViewers(streamId: string) {
    return await this.streamViewerRepository.find({
      where: { streamId },
      relations: ['viewer', 'viewer.profile'],
    });
  }

  async getStreamStats(streamId: string) {
    const stream = await this.getStreamById(streamId);

    return {
      id: stream.id,
      title: stream.title,
      status: stream.status,
      viewerCount: stream.viewerCount,
      startedAt: stream.createdAt,
      endedAt: stream.endedAt,
      duration: stream.endedAt
        ? Math.floor((new Date(stream.endedAt).getTime() - new Date(stream.createdAt).getTime()) / 1000)
        : Math.floor((new Date().getTime() - new Date(stream.createdAt).getTime()) / 1000),
    };
  }

  private generateStreamKey(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
