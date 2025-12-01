import { IUserDAO } from "./IUserDAO";
import { ISessionDAO } from "./ISessionDAO";
import { IFollowDAO } from "./IFollowDAO";
import { IStatusDAO } from "./IStatusDAO";
import { IFeedDAO } from "./IFeedDAO";
import { IS3DAO } from "./IS3DAO";

export interface IDAOFactory {
  createUserDAO(): IUserDAO;
  createSessionDAO(): ISessionDAO;
  createFollowDAO(): IFollowDAO;
  createStatusDAO(): IStatusDAO;
  createFeedDAO(): IFeedDAO;
  createS3DAO(): IS3DAO;
}
