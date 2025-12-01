import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { IDAOFactory } from "../interface/IDAOFactory";
import { IUserDAO } from "../interface/IUserDAO";
import { ISessionDAO } from "../interface/ISessionDAO";
import { IFollowDAO } from "../interface/IFollowDAO";
import { IStatusDAO } from "../interface/IStatusDAO";
import { IFeedDAO } from "../interface/IFeedDAO";
import { IS3DAO } from "../interface/IS3DAO";
import { DynamoUserDAO } from "../dynamo/DynamoUserDAO";
import { DynamoSessionDAO } from "../dynamo/DynamoSessionDAO";
import { DynamoFollowDAO } from "../dynamo/DynamoFollowDAO";
import { DynamoStatusDAO } from "../dynamo/DynamoStatusDAO";
import { DynamoFeedDAO } from "../dynamo/DynamoFeedDAO";
import { S3DAO } from "../s3/S3DAO";

export class DynamoDAOFactory implements IDAOFactory {
  private static instance: DynamoDAOFactory;
  private dynamoClient: DynamoDBClient;
  private docClient: DynamoDBDocumentClient;
  private s3Client: S3Client;

  private constructor() {
    this.dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || "us-west-1" });
    this.docClient = DynamoDBDocumentClient.from(this.dynamoClient);
    this.s3Client = new S3Client({ region: process.env.AWS_REGION || "us-west-1" });
  }

  public static getInstance(): DynamoDAOFactory {
    if (!DynamoDAOFactory.instance) {
      DynamoDAOFactory.instance = new DynamoDAOFactory();
    }
    return DynamoDAOFactory.instance;
  }

  createUserDAO(): IUserDAO {
    return new DynamoUserDAO(this.docClient);
  }

  createSessionDAO(): ISessionDAO {
    return new DynamoSessionDAO(this.docClient);
  }

  createFollowDAO(): IFollowDAO {
    return new DynamoFollowDAO(this.docClient);
  }

  createStatusDAO(): IStatusDAO {
    return new DynamoStatusDAO(this.docClient);
  }

  createFeedDAO(): IFeedDAO {
    return new DynamoFeedDAO(this.docClient);
  }

  createS3DAO(): IS3DAO {
    return new S3DAO(this.s3Client);
  }
}
