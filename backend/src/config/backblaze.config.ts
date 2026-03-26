/**
 * Backblaze B2 Configuration
 * 
 * Configuration for file uploads to Backblaze B2 bucket.
 * Currently mocked for development. Can be integrated with actual B2 SDK when needed.
 */

export const backblazeConfig = {
  applicationKeyId: process.env.BACKBLAZE_APPLICATION_KEY_ID || '',
  applicationKey: process.env.BACKBLAZE_APPLICATION_KEY || '',
  bucketId: process.env.BACKBLAZE_BUCKET_ID || '',
  bucketName: process.env.BACKBLAZE_BUCKET_NAME || 'dating-platform-uploads',
};

/**
 * Mock upload function
 * Returns a placeholder URL that can be replaced with actual B2 upload logic
 */
export function generateBackblazeUrl(
  filename: string,
  fileType: 'avatar' | 'photo' | 'post' | 'stream' = 'photo',
): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(7);
  return `https://mock-backblaze.example.com/${fileType}/${timestamp}-${randomSuffix}-${filename}`;
}

/**
 * TODO: Implement actual Backblaze B2 upload
 * This function should be replaced with actual B2 SDK integration
 * when Backblaze credentials are available
 */
export async function uploadToBackblaze(
  fileBuffer: Buffer,
  filename: string,
  mimeType: string,
  fileType: 'avatar' | 'photo' | 'post' | 'stream' = 'photo',
): Promise<string> {
  // For now, return mock URL
  // In production, integrate with B2 SDK:
  // const b2 = new Backblaze.B2({auth: {...}});
  // const uploadUrl = await b2.getUploadUrl();
  // const file = await b2.uploadFile({...});
  // return file.fileUrl;

  return generateBackblazeUrl(filename, fileType);
}
