import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';

/**
 * B2StorageService handles all Backblaze B2 file operations.
 * Responsibilities:
 * - Upload images/videos to B2
 * - Delete files from B2
 * - Validate media files (MIME type, size)
 * - Generate authenticated B2 URLs
 */
@Injectable()
export class B2StorageService {
  private readonly logger = new Logger(B2StorageService.name);
  private readonly appKeyId: string;
  private readonly appKey: string;
  private readonly bucketId: string;
  private readonly bucketName: string;
  private b2AuthToken: string;
  private b2ApiUrl: string;
  private uploadUrl: string;
  private uploadAuthToken: string;
  private tokenExpiresAt: number;

  // File size limits (in bytes)
  private readonly MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB for images
  private readonly MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB for videos
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  private readonly ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

  constructor(private configService: ConfigService) {
    this.appKeyId = this.configService.get('B2_APP_KEY_ID');
    this.appKey = this.configService.get('B2_APP_KEY');
    this.bucketId = this.configService.get('B2_BUCKET_ID');
    this.bucketName = this.configService.get('B2_BUCKET_NAME');

    if (!this.appKeyId || !this.appKey || !this.bucketId || !this.bucketName) {
      this.logger.warn('B2 credentials not fully configured. File upload will fail.');
    }
  }

  /**
   * Validate media file (MIME type and size)
   */
  validateMediaFile(file: Express.Multer.File, mediaType: 'image' | 'video'): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedTypes = mediaType === 'image' ? this.ALLOWED_IMAGE_TYPES : this.ALLOWED_VIDEO_TYPES;
    const maxSize = mediaType === 'image' ? this.MAX_IMAGE_SIZE : this.MAX_VIDEO_SIZE;

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid ${mediaType} format. Allowed: ${allowedTypes.join(', ')}`
      );
    }

    if (file.size > maxSize) {
      throw new BadRequestException(
        `${mediaType} too large. Max size: ${maxSize / (1024 * 1024)} MB`
      );
    }
  }

  /**
   * Authenticate with B2 and get authorization token
   */
  private async authenticateB2(): Promise<void> {
    try {
      const credentials = Buffer.from(`${this.appKeyId}:${this.appKey}`).toString('base64');

      const response = await axios.get('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });

      this.b2AuthToken = response.data.authorizationToken;
      this.b2ApiUrl = response.data.apiUrl;
      this.tokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // Token valid for 24 hours

      this.logger.debug('Successfully authenticated with B2');
    } catch (error) {
      this.logger.error('B2 authentication failed', error);
      throw new InternalServerErrorException('Failed to authenticate with B2');
    }
  }

  /**
   * Get upload URL from B2
   */
  private async getUploadUrl(): Promise<void> {
    // Check if current upload URL is still valid (refresh if expiring)
    if (this.uploadUrl && this.uploadAuthToken && Date.now() < this.tokenExpiresAt - 60000) {
      return; // Token still valid
    }

    // Re-authenticate if needed
    if (!this.b2AuthToken || Date.now() >= this.tokenExpiresAt) {
      await this.authenticateB2();
    }

    try {
      const response = await axios.post(
        `${this.b2ApiUrl}/b2api/v2/b2_get_upload_url`,
        {
          bucketId: this.bucketId,
        },
        {
          headers: {
            Authorization: this.b2AuthToken,
          },
        }
      );

      this.uploadUrl = response.data.uploadUrl;
      this.uploadAuthToken = response.data.authorizationToken;
    } catch (error) {
      this.logger.error('Failed to get upload URL from B2', error);
      throw new InternalServerErrorException('Failed to get upload URL');
    }
  }

  /**
   * Upload file to B2 and return authenticated URL
   */
  async uploadFile(
    file: Express.Multer.File,
    mediaType: 'image' | 'video',
    fileName?: string
  ): Promise<{ url: string; publicId: string }> {
    try {
      // Validate file
      this.validateMediaFile(file, mediaType);

      // Get upload URL
      await this.getUploadUrl();

      // Generate unique filename with timestamp to avoid collisions
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const finalFileName = fileName || `${mediaType}-${timestamp}-${randomStr}.${this.getFileExtension(file.mimetype)}`;

      // Upload to B2
      const uploadResponse = await axios.post(
        this.uploadUrl,
        file.buffer,
        {
          headers: {
            'Authorization': this.uploadAuthToken,
            'X-Bz-File-Name': finalFileName,
            'Content-Type': file.mimetype,
            'X-Bz-Content-Sha1': 'do_not_verify', // For testing; use sha1 in production
          },
        }
      );

      const fileId = uploadResponse.data.fileId;
      const fileInfo = uploadResponse.data;

      // Construct authenticated URL
      const url = `${this.bucketName}.s3.us-west-001.backblazeb2.com/${finalFileName}`;

      this.logger.log(`File uploaded successfully: ${finalFileName} (ID: ${fileId})`);

      return {
        url,
        publicId: fileId,
      };
    } catch (error) {
      this.logger.error('File upload to B2 failed', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to upload file to B2');
    }
  }

  /**
   * Delete file from B2
   */
  async deleteFile(publicId: string, fileName: string): Promise<void> {
    try {
      // Ensure we have a valid auth token
      if (!this.b2AuthToken || Date.now() >= this.tokenExpiresAt) {
        await this.authenticateB2();
      }

      // For B2 API, we need file ID and file name to delete
      // Using hideFile which soft-deletes (preferred to hard delete)
      await axios.post(
        `${this.b2ApiUrl}/b2api/v2/b2_hide_file`,
        {
          bucketId: this.bucketId,
          fileName: fileName,
        },
        {
          headers: {
            Authorization: this.b2AuthToken,
          },
        }
      );

      this.logger.log(`File hidden from B2: ${fileName} (ID: ${publicId})`);
    } catch (error) {
      // Log error but don't throw - file deletion failures shouldn't break the flow
      this.logger.warn(`Failed to hide file in B2: ${fileName}`, error);
    }
  }

  /**
   * Helper: Get file extension from MIME type
   */
  private getFileExtension(mimeType: string): string {
    const mimeMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'video/mp4': 'mp4',
      'video/webm': 'webm',
      'video/quicktime': 'mov',
    };
    return mimeMap[mimeType] || 'bin';
  }

  /**
   * Helper: Check if token is expired
   */
  private isTokenExpired(): boolean {
    return !this.b2AuthToken || Date.now() >= this.tokenExpiresAt;
  }
}
