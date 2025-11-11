import { AuthToken, FollowRequest, User, UserDto } from "tweeter-shared";
import { Service } from "./Service";
import { ServerFacade } from "./ServerFacade";

export class FollowService implements Service {
  private serverFacade = new ServerFacade();

  public async loadMoreFollowers(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null
  ): Promise<[User[], boolean]> {
    const request = {
      token: authToken.token,
      userAlias: userAlias,
      pageSize: pageSize,
      lastItem: lastItem ? lastItem.dto : null,
    };
    return await this.serverFacade.getMoreFollowers(request);
  }

  public async loadMoreFollowees(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null
  ): Promise<[User[], boolean]> {
    const request = {
      token: authToken.token,
      userAlias: userAlias,
      pageSize: pageSize,
      lastItem: lastItem ? lastItem.dto : null,
    };
    return await this.serverFacade.getMoreFollowees(request);
  }

  public async getFolloweeCount(
    authToken: AuthToken,
    user: User
  ): Promise<number> {
    const request = {
      token: authToken.token,
      user: user.dto,
    };
    return await this.serverFacade.getFolloweeCount(request);
  }

  public async getFollowerCount(
    authToken: AuthToken,
    user: User
  ): Promise<number> {
    const request = {
      token: authToken.token,
      user: user.dto,
    };
    return await this.serverFacade.getFollowerCount(request);
  }

  async getIsFollowerStatus(
    authToken: AuthToken,
    user: User,
    selectedUser: User
  ): Promise<boolean> {
    const request = {
      token: authToken.token,
      user: user.dto,
      selectedUser: selectedUser.dto,
    };
    return await this.serverFacade.getIsFollowerStatus(request);
  }

  async follow(
    authToken: AuthToken,
    userToFollow: User
  ): Promise<void> {
    const request = {
      token: authToken.token,
      user: userToFollow.dto,
    };
    await this.serverFacade.follow(request);
  }

  async unfollow(
    authToken: AuthToken,
    userToUnfollow: User
  ): Promise<void> {
    const request: FollowRequest = {
      token: authToken.token,
      user: userToUnfollow.dto,
    };
    await this.serverFacade.unfollow(request);
  }
}
