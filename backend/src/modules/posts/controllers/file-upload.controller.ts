import {
  Controller,
  Post,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import multer from 'multer';
import { B2StorageService } from '../../../common/services/b2-storage.service';

/**
 * FileUploadController handles media file uploads to Backblaze B2.
 * All endpoints require JWT authentication.
 * Supports image and video uploads with size/type validation.
 */
@Controller('upload')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('JWT')
export class FileUploadController {
  constructor(private b2StorageService: B2StorageService) {}

  /**
   * Upload an image to Backblaze B2
   * Returns authenticated URL and B2 file ID
   */
  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload image',
    description: 'Upload an image file to Backblaze B2. Supports JPEG, PNG, WebP, GIF. Max 10MB.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (JPEG, PNG, WebP, GIF)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    schema: {
      example: {
        url: 'my-bucket.s3.us-west-001.backblazeb2.com/image-1234567890-abcde.jpg',
        publicId: 'file_id_from_b2',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file (format or size)',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid image format. Allowed: image/jpeg, image/png, image/webp, image/gif',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'B2 upload failed',
    schema: {
      example: {
        statusCode: 500,
        message: 'Failed to upload file to B2',
        error: 'Internal Server Error',
      },
    },
  })
  async uploadImage(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.b2StorageService.uploadFile(file, 'image');
  }

  /**
   * Upload a video to Backblaze B2
   * Returns authenticated URL and B2 file ID
   */
  @Post('video')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload video',
    description: 'Upload a video file to Backblaze B2. Supports MP4, WebM, QuickTime. Max 100MB.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Video file (MP4, WebM, QuickTime)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Video uploaded successfully',
    schema: {
      example: {
        url: 'my-bucket.s3.us-west-001.backblazeb2.com/video-1234567890-abcde.mp4',
        publicId: 'file_id_from_b2',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file (format or size)',
    schema: {
      example: {
        statusCode: 400,
        message: 'Video too large. Max size: 100 MB',
        error: 'Bad Request',
      },
    },
  })
  async uploadVideo(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.b2StorageService.uploadFile(file, 'video');
  }

  /**
   * Delete a file from Backblaze B2
   * Soft-deletes the file (hides it from listings)
   */
  @Delete(':publicId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete uploaded file',
    description:
      'Delete a file from B2 by its public ID. Soft-deletes the file (hides from listings, but can be recovered).',
  })
  @ApiParam({
    name: 'publicId',
    description: 'B2 file ID (returned from upload endpoint)',
    example: 'file_id_from_b2',
  })
  @ApiResponse({
    status: 204,
    description: 'File deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
  })
  async deleteFile(
    @Param('publicId') publicId: string
  ): Promise<void> {
    // Note: In a real implementation, you might want to:
    // 1. Verify the user owns this file
    // 2. Verify the publicId exists in your database
    // 3. Delete the database record before deleting from B2
    
    // For now, we'll just call B2 delete
    // The fileName would typically be stored in your PostMedia entity
    // This is a simplified version - you may need to adjust based on your needs
    await this.b2StorageService.deleteFile(publicId, 'unknown');
  }
}
