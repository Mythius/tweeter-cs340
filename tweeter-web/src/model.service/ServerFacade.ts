import {
  PagedUserItemRequest,
  PagedUserItemResponse,
  PagedStatusItemRequest,
  PagedStatusItemResponse,
  GetFollowCountRequest,
  GetFollowCountResponse,
  GetIsFollowerStatusRequest,
  GetIsFollowerStatusResponse,
  FollowRequest,
  GetUserRequest,
  GetUserResponse,
  RegisterRequest,
  LoginRequest,
  PostStatusRequest,
  AuthenticateResponse,
  TweeterResponse,
  User,
  Status,
  AuthToken,
} from "tweeter-shared";
import { ClientCommunicator } from "./ClientCommunicator";

export class ServerFacade {
  private SERVER_URL = "https://zs0qqy7vx2.execute-api.us-west-1.amazonaws.com/prod";

  private clientCommunicator = new ClientCommunicator(this.SERVER_URL);

  // ==================== Follow Endpoints ====================

  public async getMoreFollowees(
    request: PagedUserItemRequest
  ): Promise<[User[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      PagedUserItemRequest,
      PagedUserItemResponse
    >(request, "/follow/getfollowees");

    // Convert the UserDto array returned by ClientCommunicator to a User array
    const items: User[] | null =
      response.success && response.items
        ? response.items.map((dto) => User.fromDto(dto) as User)
        : null;

    // Handle errors
    if (response.success) {
      if (items == null) {
        throw new Error(`No followees found`);
      } else {
        return [items, response.hasMore];
      }
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async getMoreFollowers(
    request: PagedUserItemRequest
  ): Promise<[User[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      PagedUserItemRequest,
      PagedUserItemResponse
    >(request, "/follow/getfollowers");

    const items: User[] | null =
      response.success && response.items
        ? response.items.map((dto) => User.fromDto(dto) as User)
        : null;

    if (response.success) {
      if (items == null) {
        throw new Error(`No followers found`);
      } else {
        return [items, response.hasMore];
      }
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async getFollowerCount(
    request: GetFollowCountRequest
  ): Promise<number> {
    const response = await this.clientCommunicator.doPost<
      GetFollowCountRequest,
      GetFollowCountResponse
    >(request, "/follow/getfollowercount");

    if (response.success) {
      return response.count;
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async getFolloweeCount(
    request: GetFollowCountRequest
  ): Promise<number> {
    const response = await this.clientCommunicator.doPost<
      GetFollowCountRequest,
      GetFollowCountResponse
    >(request, "/follow/getfolloweecount");

    if (response.success) {
      return response.count;
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async getIsFollowerStatus(
    request: GetIsFollowerStatusRequest
  ): Promise<boolean> {
    const response = await this.clientCommunicator.doPost<
      GetIsFollowerStatusRequest,
      GetIsFollowerStatusResponse
    >(request, "/follow/getisfollowerstatus");

    if (response.success) {
      return response.isFollower;
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async follow(request: FollowRequest): Promise<void> {
    const response = await this.clientCommunicator.doPost<
      FollowRequest,
      TweeterResponse
    >(request, "/follow/follow");

    if (!response.success) {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async unfollow(request: FollowRequest): Promise<void> {
    const response = await this.clientCommunicator.doPost<
      FollowRequest,
      TweeterResponse
    >(request, "/follow/unfollow");

    if (!response.success) {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  // ==================== User Endpoints ====================

  public async getUser(request: GetUserRequest): Promise<User | null> {
    const response = await this.clientCommunicator.doPost<
      GetUserRequest,
      GetUserResponse
    >(request, "/user/getuser");

    if (response.success) {
      return response.user ? User.fromDto(response.user) : null;
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async register(
    request: RegisterRequest
  ): Promise<[User, AuthToken]> {
    const response = await this.clientCommunicator.doPost<
      any,
      AuthenticateResponse
    >(request, "/user/register");

    if (response.success) {
      const user = User.fromDto(response.user);
      if (user === null) {
        throw new Error("Invalid user returned from registration");
      }
      const authToken = AuthToken.fromDto({ token: response.token, timestamp: Date.now() });
      if (authToken === null) {
        throw new Error("Invalid auth token returned from registration");
      }
      return [user, authToken];
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async login(request: LoginRequest): Promise<[User, AuthToken]> {
    const response = await this.clientCommunicator.doPost<
      any,
      AuthenticateResponse
    >(request, "/user/login");

    if (response.success) {
      const user = User.fromDto(response.user);
      if (user === null) {
        throw new Error("Invalid user returned from login");
      }
      const authToken = AuthToken.fromDto({ token: response.token, timestamp: Date.now() });
      if (authToken === null) {
        throw new Error("Invalid auth token returned from login");
      }
      return [user, authToken];
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async logout(authToken: AuthToken): Promise<void> {
    const response = await this.clientCommunicator.doPost<
      { token: string },
      TweeterResponse
    >({ token: authToken.token }, "/user/logout");

    if (!response.success) {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  // ==================== Status Endpoints ====================

  public async getFeed(
    request: PagedStatusItemRequest
  ): Promise<[Status[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      PagedStatusItemRequest,
      PagedStatusItemResponse
    >(request, "/status/getfeed");

    const items: Status[] | null =
      response.success && response.items
        ? response.items.map((dto) => Status.fromDto(dto) as Status)
        : null;

    if (response.success) {
      if (items == null) {
        throw new Error(`No feed items found`);
      } else {
        return [items, response.hasMore];
      }
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async getStory(
    request: PagedStatusItemRequest
  ): Promise<[Status[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      PagedStatusItemRequest,
      PagedStatusItemResponse
    >(request, "/status/getstory");

    const items: Status[] | null =
      response.success && response.items
        ? response.items.map((dto) => Status.fromDto(dto) as Status)
        : null;

    if (response.success) {
      if (items == null) {
        throw new Error(`No story items found`);
      } else {
        return [items, response.hasMore];
      }
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  // ==================== Post Endpoints ====================

  public async postStatus(request: PostStatusRequest): Promise<void> {
    const response = await this.clientCommunicator.doPost<
      PostStatusRequest,
      TweeterResponse
    >(request, "/post/poststatus");

    if (!response.success) {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }
}