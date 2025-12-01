import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { IS3DAO } from "../interface/IS3DAO";

export class S3DAO implements IS3DAO {
  private s3Client: S3Client;
  private readonly bucketName = "tweeter-matthias-profile-images";
  private readonly region = process.env.AWS_REGION || "us-west-1";

  constructor(s3Client: S3Client) {
    this.s3Client = s3Client;
  }

  async uploadImage(imageBytes: string, fileExtension: string): Promise<string> {
    const timestamp = Date.now();
    const randomId = uuidv4();
    const key = `users/${randomId}-${timestamp}.${fileExtension}`;

    try {
      // Decode base64 image
      const buffer = Buffer.from(imageBytes, "base64");

      // Upload to S3
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: buffer,
          ContentType: `image/${fileExtension}`,
          ACL: "public-read",
        })
      );

      // Return public URL
      return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
    } catch (error) {
      throw new Error(`[internal-server-error] Failed to upload image to S3: ${error}`);
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const key = this.extractKeyFromUrl(imageUrl);
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        })
      );
    } catch (error) {
      throw new Error(`[internal-server-error] Failed to delete image from S3: ${error}`);
    }
  }

  private extractKeyFromUrl(url: string): string {
    // Extract key from URL format: https://bucket.s3.region.amazonaws.com/key
    const urlParts = url.split("/");
    return urlParts.slice(3).join("/");
  }
}
