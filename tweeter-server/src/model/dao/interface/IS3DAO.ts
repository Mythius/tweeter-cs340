export interface IS3DAO {
  /**
   * Uploads an image to S3
   * @param imageBytes Base64 encoded image bytes
   * @param fileExtension The file extension (jpg, png, etc.)
   * @returns The public URL of the uploaded image
   */
  uploadImage(imageBytes: string, fileExtension: string): Promise<string>;

  /**
   * Deletes an image from S3
   * @param imageUrl The URL of the image to delete
   */
  deleteImage(imageUrl: string): Promise<void>;
}
