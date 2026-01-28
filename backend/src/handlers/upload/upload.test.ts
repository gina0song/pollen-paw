import { randomBytes } from 'crypto';

describe('S3 Key Generation Logic', () => {
  test('should generate a unique S3 key with petId prefix', () => {
    const petId = 1;
    const fileName = 'test.jpg';
    const fileExtension = fileName.split('.').pop();
    const uniqueId = randomBytes(16).toString('hex');
    const timestamp = Date.now();
    
    const s3Key = `pets/${petId}/${timestamp}-${uniqueId}.${fileExtension}`;
    
    expect(s3Key).toContain('pets/1/');
    expect(s3Key).toContain('.jpg');
    expect(uniqueId).toHaveLength(32);
  });
});