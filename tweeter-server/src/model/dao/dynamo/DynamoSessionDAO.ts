import { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ISessionDAO } from "../interface/ISessionDAO";

export class DynamoSessionDAO implements ISessionDAO {
  private readonly tableName = "tweeter-session";
  private readonly SESSION_EXPIRATION_HOURS = 24;
  private docClient: DynamoDBDocumentClient;

  constructor(docClient: DynamoDBDocumentClient) {
    this.docClient = docClient;
  }

  async create(token: string, userAlias: string, timestamp: number): Promise<void> {
    const ttl = Math.floor((timestamp + this.SESSION_EXPIRATION_HOURS * 60 * 60 * 1000) / 1000);

    const params = {
      TableName: this.tableName,
      Item: {
        token,
        userAlias,
        timestamp,
        ttl, // DynamoDB TTL (in seconds since epoch)
      },
    };

    try {
      await this.docClient.send(new PutCommand(params));
    } catch (error) {
      throw new Error(`[internal-server-error] Failed to create session: ${error}`);
    }
  }

  async get(token: string): Promise<{ userAlias: string; timestamp: number } | null> {
    const params = {
      TableName: this.tableName,
      Key: { token },
    };

    try {
      const result = await this.docClient.send(new GetCommand(params));
      if (!result.Item) {
        return null;
      }

      return {
        userAlias: result.Item.userAlias,
        timestamp: result.Item.timestamp,
      };
    } catch (error) {
      throw new Error(`[internal-server-error] Failed to get session: ${error}`);
    }
  }

  async delete(token: string): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: { token },
    };

    try {
      await this.docClient.send(new DeleteCommand(params));
    } catch (error) {
      throw new Error(`[internal-server-error] Failed to delete session: ${error}`);
    }
  }
}
