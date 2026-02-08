import { APIGatewayProxyHandler } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomBytes } from 'crypto';

const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

interface UploadRequest {
  fileName: string;
  fileType: string;
  petId?: number; 
}

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Generating upload URL for request:', event.requestContext.requestId);

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Request body is required' }),
      };
    }

    const uploadData: UploadRequest = JSON.parse(event.body);

    if (!uploadData.fileName || !uploadData.fileType) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          message: 'fileName and fileType are required' 
        }),
      };
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(uploadData.fileType.toLowerCase())) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          message: 'Only image files (JPEG, PNG, WebP) are allowed' 
        }),
      };
    }

    const fileExtension = uploadData.fileName.split('.').pop();
    const uniqueId = randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const s3Key = uploadData.petId 
      ? `pets/${uploadData.petId}/${timestamp}-${uniqueId}.${fileExtension}`
      : `general/${timestamp}-${uniqueId}.${fileExtension}`;

    const bucket = process.env.S3_BUCKET;
    
    if (!bucket) {
      throw new Error('S3_BUCKET environment variable not set');
    }

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      ContentType: uploadData.fileType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 300 
    });

    const photoUrl = `https://${bucket}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        uploadUrl,  
        photoUrl,   
        key: s3Key,
      }),
    };
  } catch (error) {
    console.error('Upload URL generation error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'Failed to generate upload URL' }),
    };
  }
};