import {
  DynamoDBDocumentClient,
  PutCommand,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { Status, User } from "tweeter-shared";
import { IStatusDAO } from "../interface/IStatusDAO";

export class DynamoStatusDAO implements IStatusDAO {
  private readonly tableName = "tweeter-status";
  private docClient: DynamoDBDocumentClient;

  constructor(docClient: DynamoDBDocumentClient) {
    this.docClient = docClient;
  }

  async create(status: Status): Promise<void> {
    const params = {
      TableName: this.tableName,
      Item: {
        user_alias: status.user.alias,
        timestamp: -status.timestamp, // Negative for descending order
        post: status.post,
        user_firstName: status.user.firstName,
        user_lastName: status.user.lastName,
        user_imageUrl: status.user.imageUrl,
      },
    };

    try {
      await this.docClient.send(new PutCommand(params));
    } catch (error) {
      throw new Error(`[internal-server-error] Failed to create status: ${error}`);
    }
  }

  async getStory(
    userAlias: string,
    limit: number,
    lastTimestamp?: number
  ): Promise<[Status[], number | null]> {
    const params: any = {
      TableName: this.tableName,
      KeyConditionExpression: "user_alias = :userAlias",
      ExpressionAttributeValues: {
        ":userAlias": userAlias,
      },
      Limit: limit,
    };

    if (lastTimestamp) {
      params.ExclusiveStartKey = {
        user_alias: userAlias,
        timestamp: -lastTimestamp, // Remember: stored as negative
      };
    }

    try {
      const result = await this.docClient.send(new QueryCommand(params));
      const statuses =
        result.Items?.map((item) => {
          const user = new User(
            item.user_firstName,
            item.user_lastName,
            item.user_alias,
            item.user_imageUrl
          );
          return new Status(item.post, user, Math.abs(item.timestamp));
        }) || [];

      const lastKey = result.LastEvaluatedKey
        ? Math.abs(result.LastEvaluatedKey.timestamp)
        : null;

      return [statuses, lastKey];
    } catch (error) {
      throw new Error(`[internal-server-error] Failed to get story: ${error}`);
    }
  }

  async delete(userAlias: string, timestamp: number): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: {
        user_alias: userAlias,
        timestamp: -timestamp, // Stored as negative
      },
    };

    try {
      await this.docClient.send(new DeleteCommand(params));
    } catch (error) {
      throw new Error(`[internal-server-error] Failed to delete status: ${error}`);
    }
  }
}
