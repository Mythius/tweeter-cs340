import {
  DynamoDBDocumentClient,
  PutCommand,
  DeleteCommand,
  GetCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { User } from "tweeter-shared";
import { IFollowDAO } from "../interface/IFollowDAO";

export class DynamoFollowDAO implements IFollowDAO {
  private readonly tableName = "tweeter-follow";
  private readonly indexName = "followee_index";
  private docClient: DynamoDBDocumentClient;

  constructor(docClient: DynamoDBDocumentClient) {
    this.docClient = docClient;
  }

  async create(
    followerAlias: string,
    followeeAlias: string,
    followerUser: User,
    followeeUser: User
  ): Promise<void> {
    const params = {
      TableName: this.tableName,
      Item: {
        follower_alias: followerAlias,
        followee_alias: followeeAlias,
        follower_firstName: followerUser.firstName,
        follower_lastName: followerUser.lastName,
        follower_imageUrl: followerUser.imageUrl,
        followee_firstName: followeeUser.firstName,
        followee_lastName: followeeUser.lastName,
        followee_imageUrl: followeeUser.imageUrl,
        timestamp: Date.now(),
      },
    };

    try {
      await this.docClient.send(new PutCommand(params));
    } catch (error) {
      throw new Error(`[internal-server-error] Failed to create follow relationship: ${error}`);
    }
  }

  async delete(followerAlias: string, followeeAlias: string): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: {
        follower_alias: followerAlias,
        followee_alias: followeeAlias,
      },
    };

    try {
      await this.docClient.send(new DeleteCommand(params));
    } catch (error) {
      throw new Error(`[internal-server-error] Failed to delete follow relationship: ${error}`);
    }
  }

  async isFollowing(followerAlias: string, followeeAlias: string): Promise<boolean> {
    const params = {
      TableName: this.tableName,
      Key: {
        follower_alias: followerAlias,
        followee_alias: followeeAlias,
      },
    };

    try {
      const result = await this.docClient.send(new GetCommand(params));
      return !!result.Item;
    } catch (error) {
      throw new Error(`[internal-server-error] Failed to check follow status: ${error}`);
    }
  }

  async getFollowees(
    followerAlias: string,
    limit: number,
    lastFolloweeAlias?: string
  ): Promise<[User[], string | null]> {
    const params: any = {
      TableName: this.tableName,
      KeyConditionExpression: "follower_alias = :follower",
      ExpressionAttributeValues: {
        ":follower": followerAlias,
      },
      Limit: limit,
    };

    if (lastFolloweeAlias) {
      params.ExclusiveStartKey = {
        follower_alias: followerAlias,
        followee_alias: lastFolloweeAlias,
      };
    }

    try {
      const result = await this.docClient.send(new QueryCommand(params));
      const users =
        result.Items?.map(
          (item) => new User(item.followee_firstName, item.followee_lastName, item.followee_alias, item.followee_imageUrl)
        ) || [];

      const lastKey = result.LastEvaluatedKey ? result.LastEvaluatedKey.followee_alias : null;
      return [users, lastKey];
    } catch (error) {
      throw new Error(`[internal-server-error] Failed to get followees: ${error}`);
    }
  }

  async getFollowers(
    followeeAlias: string,
    limit: number,
    lastFollowerAlias?: string
  ): Promise<[User[], string | null]> {
    const params: any = {
      TableName: this.tableName,
      IndexName: this.indexName,
      KeyConditionExpression: "followee_alias = :followee",
      ExpressionAttributeValues: {
        ":followee": followeeAlias,
      },
      Limit: limit,
    };

    if (lastFollowerAlias) {
      params.ExclusiveStartKey = {
        followee_alias: followeeAlias,
        follower_alias: lastFollowerAlias,
      };
    }

    try {
      const result = await this.docClient.send(new QueryCommand(params));
      const users =
        result.Items?.map(
          (item) => new User(item.follower_firstName, item.follower_lastName, item.follower_alias, item.follower_imageUrl)
        ) || [];

      const lastKey = result.LastEvaluatedKey ? result.LastEvaluatedKey.follower_alias : null;
      return [users, lastKey];
    } catch (error) {
      throw new Error(`[internal-server-error] Failed to get followers: ${error}`);
    }
  }

  async getFollowerCount(followeeAlias: string): Promise<number> {
    let count = 0;
    let lastEvaluatedKey: any = undefined;

    try {
      do {
        const params: any = {
          TableName: this.tableName,
          IndexName: this.indexName,
          KeyConditionExpression: "followee_alias = :followee",
          ExpressionAttributeValues: {
            ":followee": followeeAlias,
          },
          Select: "COUNT" as const,
        };

        if (lastEvaluatedKey) {
          params.ExclusiveStartKey = lastEvaluatedKey;
        }

        const result = await this.docClient.send(new QueryCommand(params));
        count += result.Count || 0;
        lastEvaluatedKey = result.LastEvaluatedKey;
      } while (lastEvaluatedKey);

      return count;
    } catch (error) {
      throw new Error(`[internal-server-error] Failed to get follower count: ${error}`);
    }
  }

  async getFolloweeCount(followerAlias: string): Promise<number> {
    let count = 0;
    let lastEvaluatedKey: any = undefined;

    try {
      do {
        const params: any = {
          TableName: this.tableName,
          KeyConditionExpression: "follower_alias = :follower",
          ExpressionAttributeValues: {
            ":follower": followerAlias,
          },
          Select: "COUNT" as const,
        };

        if (lastEvaluatedKey) {
          params.ExclusiveStartKey = lastEvaluatedKey;
        }

        const result = await this.docClient.send(new QueryCommand(params));
        count += result.Count || 0;
        lastEvaluatedKey = result.LastEvaluatedKey;
      } while (lastEvaluatedKey);

      return count;
    } catch (error) {
      throw new Error(`[internal-server-error] Failed to get followee count: ${error}`);
    }
  }

  async getFollowerAliases(followeeAlias: string): Promise<string[]> {
    const aliases: string[] = [];
    let lastEvaluatedKey: any = undefined;

    try {
      do {
        const params: any = {
          TableName: this.tableName,
          IndexName: this.indexName,
          KeyConditionExpression: "followee_alias = :followee",
          ExpressionAttributeValues: {
            ":followee": followeeAlias,
          },
          ProjectionExpression: "follower_alias",
        };

        if (lastEvaluatedKey) {
          params.ExclusiveStartKey = lastEvaluatedKey;
        }

        const result = await this.docClient.send(new QueryCommand(params));
        if (result.Items) {
          aliases.push(...result.Items.map((item) => item.follower_alias));
        }

        lastEvaluatedKey = result.LastEvaluatedKey;
      } while (lastEvaluatedKey);

      return aliases;
    } catch (error) {
      throw new Error(`[internal-server-error] Failed to get follower aliases: ${error}`);
    }
  }
}
