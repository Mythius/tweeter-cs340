import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { User } from "tweeter-shared";
import { IUserDAO } from "../interface/IUserDAO";

export class DynamoUserDAO implements IUserDAO {
  private readonly tableName = "tweeter-user";
  private docClient: DynamoDBDocumentClient;

  constructor(docClient: DynamoDBDocumentClient) {
    this.docClient = docClient;
  }

  async create(user: User, passwordHash: string): Promise<void> {
    const params = {
      TableName: this.tableName,
      Item: {
        alias: user.alias,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        passwordHash: passwordHash,
        followerCount: 0,
        followeeCount: 0,
      },
    };

    try {
      await this.docClient.send(new PutCommand(params));
    } catch (error) {
      throw new Error(`[internal-server-error] Failed to create user: ${error}`);
    }
  }

  async getByAlias(alias: string): Promise<User | null> {
    const params = {
      TableName: this.tableName,
      Key: { alias },
    };

    try {
      const result = await this.docClient.send(new GetCommand(params));
      if (!result.Item) {
        return null;
      }

      return new User(
        result.Item.firstName,
        result.Item.lastName,
        result.Item.alias,
        result.Item.imageUrl
      );
    } catch (error) {
      throw new Error(`[internal-server-error] Failed to get user: ${error}`);
    }
  }

  async getUserWithPassword(alias: string): Promise<{ user: User; passwordHash: string } | null> {
    const params = {
      TableName: this.tableName,
      Key: { alias },
    };

    try {
      const result = await this.docClient.send(new GetCommand(params));
      if (!result.Item) {
        return null;
      }

      const user = new User(
        result.Item.firstName,
        result.Item.lastName,
        result.Item.alias,
        result.Item.imageUrl
      );

      return {
        user,
        passwordHash: result.Item.passwordHash,
      };
    } catch (error) {
      throw new Error(`[internal-server-error] Failed to get user with password: ${error}`);
    }
  }

  async update(user: User): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: { alias: user.alias },
      UpdateExpression: "SET firstName = :fn, lastName = :ln, imageUrl = :img",
      ExpressionAttributeValues: {
        ":fn": user.firstName,
        ":ln": user.lastName,
        ":img": user.imageUrl,
      },
    };

    try {
      await this.docClient.send(new UpdateCommand(params));
    } catch (error) {
      throw new Error(`[internal-server-error] Failed to update user: ${error}`);
    }
  }

  async incrementFollowerCount(alias: string, delta: number): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: { alias },
      UpdateExpression: "ADD followerCount :delta",
      ExpressionAttributeValues: {
        ":delta": delta,
      },
    };

    try {
      await this.docClient.send(new UpdateCommand(params));
    } catch (error) {
      throw new Error(`[internal-server-error] Failed to increment follower count: ${error}`);
    }
  }

  async incrementFolloweeCount(alias: string, delta: number): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: { alias },
      UpdateExpression: "ADD followeeCount :delta",
      ExpressionAttributeValues: {
        ":delta": delta,
      },
    };

    try {
      await this.docClient.send(new UpdateCommand(params));
    } catch (error) {
      throw new Error(`[internal-server-error] Failed to increment followee count: ${error}`);
    }
  }
}
