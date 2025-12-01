import { User, UserDto } from "tweeter-shared";
import { IDAOFactory } from "../../dao/interface/IDAOFactory";
import { DynamoDAOFactory } from "../../dao/factory/DynamoDAOFactory";
import { IFollowDAO } from "../../dao/interface/IFollowDAO";
import { IUserDAO } from "../../dao/interface/IUserDAO";
import { AuthorizationService } from "../auth/AuthorizationService";

export class FollowService {
  private followDAO: IFollowDAO;
  private userDAO: IUserDAO;
  private authService: AuthorizationService;

  constructor(daoFactory?: IDAOFactory) {
    const factory = daoFactory || DynamoDAOFactory.getInstance();
    this.followDAO = factory.createFollowDAO();
    this.userDAO = factory.createUserDAO();
    this.authService = new AuthorizationService(factory);
  }

  public async loadMoreFollowers(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {
    // Validate token
    await this.authService.validateToken(token);

    // Get followers from database
    const lastAlias = lastItem ? lastItem.alias : undefined;
    const [users, lastKey] = await this.followDAO.getFollowers(userAlias, pageSize, lastAlias);

    return [users.map((user) => user.dto), lastKey !== null];
  }

  public async loadMoreFollowees(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {
    // Validate token
    await this.authService.validateToken(token);

    // Get followees from database
    const lastAlias = lastItem ? lastItem.alias : undefined;
    const [users, lastKey] = await this.followDAO.getFollowees(userAlias, pageSize, lastAlias);

    return [users.map((user) => user.dto), lastKey !== null];
  }

  public async getFolloweeCount(token: string, user: User): Promise<number> {
    // Validate token
    await this.authService.validateToken(token);

    // Get count from database
    return await this.followDAO.getFolloweeCount(user.alias);
  }

  public async getFollowerCount(token: string, user: User): Promise<number> {
    // Validate token
    await this.authService.validateToken(token);

    // Get count from database
    return await this.followDAO.getFollowerCount(user.alias);
  }

  async getIsFollowerStatus(
    token: string,
    user: User,
    selectedUser: User
  ): Promise<boolean> {
    // Validate token
    const authenticatedUserAlias = await this.authService.validateToken(token);

    // Check if authenticated user follows the selected user
    return await this.followDAO.isFollowing(authenticatedUserAlias, selectedUser.alias);
  }

  async follow(token: string, userToFollow: User): Promise<void> {
    // Validate token and get authenticated user alias
    const authenticatedUserAlias = await this.authService.validateToken(token);

    // Get both users for denormalization
    const followerUser = await this.userDAO.getByAlias(authenticatedUserAlias);
    if (!followerUser) {
      throw new Error("[internal-server-error] Authenticated user not found");
    }

    // Create follow relationship
    await this.followDAO.create(authenticatedUserAlias, userToFollow.alias, followerUser, userToFollow);

    // Update follower/followee counts
    await this.userDAO.incrementFolloweeCount(authenticatedUserAlias, 1);
    await this.userDAO.incrementFollowerCount(userToFollow.alias, 1);
  }

  async unfollow(token: string, userToUnfollow: User): Promise<void> {
    // Validate token and get authenticated user alias
    const authenticatedUserAlias = await this.authService.validateToken(token);

    // Delete follow relationship
    await this.followDAO.delete(authenticatedUserAlias, userToUnfollow.alias);

    // Update follower/followee counts
    await this.userDAO.incrementFolloweeCount(authenticatedUserAlias, -1);
    await this.userDAO.incrementFollowerCount(userToUnfollow.alias, -1);
  }
}
