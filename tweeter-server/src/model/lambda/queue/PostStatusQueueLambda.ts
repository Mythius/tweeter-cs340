import { SQSEvent, SQSRecord } from "aws-lambda";
import { StatusDto } from "tweeter-shared";
import { DynamoDAOFactory } from "../../dao/factory/DynamoDAOFactory";
import { SQSService } from "../../service/queue/SQSService";

interface PostStatusMessage {
  statusDto: StatusDto;
  authorAlias: string;
}

/**
 * PostStatusQueueLambda
 *
 * Triggered by: PostStatusQueue (1 message per status post)
 * Purpose: Get all followers and fan out to UpdateFeedQueue
 *
 * Processing flow:
 * 1. Parse message from PostStatusQueue
 * 2. Get ALL follower aliases for the author (optimized)
 * 3. Send batch messages to UpdateFeedQueue (1 message per follower)
 */

export const handler = async (event: SQSEvent): Promise<void> => {
  console.log(`[PostStatusQueueLambda] Processing ${event.Records.length} message(s)`);

  const followDAO = DynamoDAOFactory.getInstance().createFollowDAO();
  const sqsService = new SQSService();

  // Process each message (should typically be 1, but handle multiple)
  for (const record of event.Records) {
    try {
      await processRecord(record, followDAO, sqsService);
    } catch (error) {
      console.error("[PostStatusQueueLambda] Failed to process record:", error);
      // Throwing error will cause SQS to retry entire batch
      throw error;
    }
  }

  console.log("[PostStatusQueueLambda] Successfully processed all messages");
};

async function processRecord(
  record: SQSRecord,
  followDAO: any,
  sqsService: SQSService
): Promise<void> {

  // Parse message
  const message: PostStatusMessage = JSON.parse(record.body);
  const { statusDto, authorAlias } = message;

  console.log(`[PostStatusQueueLambda] Processing status from ${authorAlias}`);

  // Get ALL follower aliases (optimized query)
  const startTime = Date.now();
  const followerAliases = await followDAO.getFollowerAliases(authorAlias);
  const queryTime = Date.now() - startTime;

  console.log(
    `[PostStatusQueueLambda] Found ${followerAliases.length} followers in ${queryTime}ms`
  );

  if (followerAliases.length === 0) {
    console.log(`[PostStatusQueueLambda] No followers to notify for ${authorAlias}`);
    return;
  }

  // Fan out to UpdateFeedQueue (batched)
  const fanoutStartTime = Date.now();
  await sqsService.sendBatchToUpdateFeedQueue(statusDto, followerAliases);
  const fanoutTime = Date.now() - fanoutStartTime;

  console.log(
    `[PostStatusQueueLambda] Queued ${followerAliases.length} feed updates in ${fanoutTime}ms`
  );
  console.log(
    `[PostStatusQueueLambda] Total processing time: ${Date.now() - startTime}ms`
  );
}
