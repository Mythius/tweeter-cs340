import {
  DynamoDBDocumentClient,
  PutCommand,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { Status, User } from "tweeter-shared";
import { IFeedDAO } from "../interface/IFeedDAO";

export class DynamoFeedDAO implements IFeedDAO {
  private readonly tableName = "tweeter-feed";
  private docClient: DynamoDBDocumentClient;

  constructor(docClient: DynamoDBDocumentClient) {
    this.docClient = docClient;
  }

  async addToFeed(receiverAlias: string, status: Status): Promise<void> {
    const params = {
      TableName: this.tableName,
      Item: {
        receiver_alias: receiverAlias,
        timestamp: -status.timestamp, 
        post: status.post,
        author_alias: status.user.alias,
        author_firstName: status.user.firstName,
        author_lastName: status.user.lastName,
        author_imageUrl: status.user.imageUrl,
      },
    };

    try {
      await this.docClient.send(new PutCommand(params));
    } catch (error) {
      throw new Error(`[internal-server-error] Failed to add to feed: ${error}`);
    }
  }

  async getFeed(
    receiverAlias: string,
    limit: number,
    lastTimestamp?: number
  ): Promise<[Status[], number | null]> {
    const params: any = {
      TableName: this.tableName,
      KeyConditionExpression: "receiver_alias = :receiverAlias",
      ExpressionAttributeValues: {
        ":receiverAlias": receiverAlias,
      },
      Limit: limit,
    };

    if (lastTimestamp) {
      params.ExclusiveStartKey = {
        receiver_alias: receiverAlias,
        timestamp: -lastTimestamp, 
      };
    }

    try {
      const result = await this.docClient.send(new QueryCommand(params));
      const statuses =
        result.Items?.map((item) => {
          const user = new User(
            item.author_firstName,
            item.author_lastName,
            item.author_alias,
            item.author_imageUrl
          );
          return new Status(item.post, user, Math.abs(item.timestamp));
        }) || [];

      const lastKey = result.LastEvaluatedKey
        ? Math.abs(result.LastEvaluatedKey.timestamp)
        : null;

      return [statuses, lastKey];
    } catch (error) {
      throw new Error(`[internal-server-error] Failed to get feed: ${error}`);
    }
  }

  async delete(receiverAlias: string, timestamp: number): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: {
        receiver_alias: receiverAlias,
        timestamp: -timestamp, 
      },
    };

    try {
      await this.docClient.send(new DeleteCommand(params));
    } catch (error) {
      throw new Error(`[internal-server-error] Failed to delete from feed: ${error}`);
    }
  }
}
