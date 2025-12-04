import { SQSEvent, SQSRecord } from "aws-lambda";
import { StatusDto, Status } from "tweeter-shared";
import { DynamoDAOFactory } from "../../dao/factory/DynamoDAOFactory";

interface UpdateFeedMessage {
  statusDto: StatusDto;
  followerAlias: string;
}


export const handler = async (event: SQSEvent): Promise<void> => {
  console.log(`[UpdateFeedQueueLambda] Processing ${event.Records.length} message(s)`);

  const feedDAO = DynamoDAOFactory.getInstance().createFeedDAO();

  try {
    // Process all messages in parallel
    const startTime = Date.now();
    await processAllRecords(event.Records, feedDAO);
    const totalTime = Date.now() - startTime;

    console.log(
      `[UpdateFeedQueueLambda] Successfully processed ${event.Records.length} messages in ${totalTime}ms`
    );

  } catch (error) {
    console.error("[UpdateFeedQueueLambda] Failed to process batch:", error);
    // Throwing error causes SQS to retry entire batch
    throw error;
  }
};

async function processAllRecords(
  records: SQSRecord[],
  feedDAO: any
): Promise<void> {

  // Parse all messages
  const feedUpdates = records.map(record => {
    const message: UpdateFeedMessage = JSON.parse(record.body);
    return message;
  });

  // Write to feed table in parallel
  const writePromises = feedUpdates.map(async ({ statusDto, followerAlias }) => {
    const status = Status.fromDto(statusDto);
    if (!status) {
      throw new Error(`[bad-request] Invalid status data for follower ${followerAlias}`);
    }

    try {
      await feedDAO.addToFeed(followerAlias, status);
      console.log(`[UpdateFeedQueueLambda] Updated feed for ${followerAlias}`);
    } catch (error) {
      console.error(
        `[UpdateFeedQueueLambda] Failed to update feed for ${followerAlias}:`,
        error
      );
      throw error; // Propagate to trigger batch retry
    }
  });

  // Wait for all writes to complete
  await Promise.all(writePromises);
}
