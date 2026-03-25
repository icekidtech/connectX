import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stream } from './entities/stream.entity';
import { StreamViewer } from './entities/stream-viewer.entity';
import { StreamsService } from './streams.service';
import { StreamsController } from './streams.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Stream, StreamViewer])],
  providers: [StreamsService],
  controllers: [StreamsController],
  exports: [StreamsService],
})
export class StreamsModule {}
