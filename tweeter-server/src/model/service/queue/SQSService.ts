import { SQSClient, SendMessageCommand, SendMessageBatchCommand } from "@aws-sdk/client-sqs";
import { StatusDto } from "tweeter-shared";

interface PostStatusMessage {
  statusDto: StatusDto;
  authorAlias: string;
}

interface UpdateFeedMessage {
  statusDto: StatusDto;
  followerAlias: string;
}

export class SQSService {
  private sqsClient: SQSClient;
  private readonly POST_STATUS_QUEUE_URL: string;
  private readonly UPDATE_FEED_QUEUE_URL: string;

  constructor() {
    this.sqsClient = new SQSClient({ region: process.env.AWS_REGION || "us-west-1" });
    this.POST_STATUS_QUEUE_URL = process.env.POST_STATUS_QUEUE_URL || "";
    this.UPDATE_FEED_QUEUE_URL = process.env.UPDATE_FEED_QUEUE_URL || "";

    if (!this.POST_STATUS_QUEUE_URL || !this.UPDATE_FEED_QUEUE_URL) {
      throw new Error("[internal-server-error] SQS queue URLs not configured");
    }
  }

  /**
   * Sends a single message to PostStatusQueue
   * Called by PostService after saving status to story
   */
  async sendToPostStatusQueue(statusDto: StatusDto, authorAlias: string): Promise<void> {
    const message: PostStatusMessage = { statusDto, authorAlias };

    const command = new SendMessageCommand({
      QueueUrl: this.POST_STATUS_QUEUE_URL,
      MessageBody: JSON.stringify(message),
      MessageAttributes: {
        authorAlias: {
          DataType: "String",
          StringValue: authorAlias
        }
      }
    });

    try {
      await this.sqsClient.send(command);
      console.log(`[SQS] Sent PostStatusQueue message for author: ${authorAlias}`);
    } catch (error) {
      console.error("[SQS] Failed to send to PostStatusQueue:", error);
      throw new Error("[internal-server-error] Failed to queue status for fan-out");
    }
  }

  /**
   * Sends batch messages to UpdateFeedQueue
   * Called by PostStatusQueueLambda with follower aliases
   *
   * Uses batch sending (10 messages per API call) for efficiency
   */
  async sendBatchToUpdateFeedQueue(statusDto: StatusDto, followerAliases: string[]): Promise<void> {
    if (followerAliases.length === 0) {
      console.log("[SQS] No followers to notify, skipping UpdateFeedQueue");
      return;
    }

    const BATCH_SIZE = 10; // SQS max batch size
    const totalBatches = Math.ceil(followerAliases.length / BATCH_SIZE);

    console.log(`[SQS] Sending ${followerAliases.length} messages in ${totalBatches} batches`);

    // Send all batches
    for (let i = 0; i < followerAliases.length; i += BATCH_SIZE) {
      const batch = followerAliases.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

      const entries = batch.map((followerAlias, index) => {
        const message: UpdateFeedMessage = { statusDto, followerAlias };
        return {
          Id: `${i}-${index}`, // Unique within this batch
          MessageBody: JSON.stringify(message),
          MessageAttributes: {
            followerAlias: {
              DataType: "String",
              StringValue: followerAlias
            }
          }
        };
      });

      const command = new SendMessageBatchCommand({
        QueueUrl: this.UPDATE_FEED_QUEUE_URL,
        Entries: entries
      });

      try {
        const result = await this.sqsClient.send(command);

        // Check for partial failures
        if (result.Failed && result.Failed.length > 0) {
          console.error(
            `[SQS] Batch ${batchNumber}/${totalBatches} had ${result.Failed.length} failures:`,
            result.Failed
          );
          throw new Error(`[internal-server-error] Failed to queue ${result.Failed.length} feed updates`);
        }

        if (result.Successful) {
          console.log(
            `[SQS] Batch ${batchNumber}/${totalBatches}: ${result.Successful.length} messages sent`
          );
        }

      } catch (error) {
        console.error(`[SQS] Failed to send batch ${batchNumber}/${totalBatches}:`, error);
        throw new Error("[internal-server-error] Failed to queue feed updates");
      }
    }

    console.log(`[SQS] Successfully queued ${followerAliases.length} feed updates`);
  }
}
