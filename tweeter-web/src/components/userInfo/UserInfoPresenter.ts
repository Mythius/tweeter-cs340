import { AuthToken, User } from "tweeter-shared";
import { FollowService } from "../../model.service/FollowService";

export interface UserInfoView {
  displayErrorMessage: (
    message: string,
    bootstrapClasses?: string | undefined
  ) => string;
  displayInfoMessage: (
    message: string,
    duration: number,
    bootstrapClasses?: string | undefined
  ) => string;
  setDisplayedUser: (user: User) => void;
  currentUser: User | null;
  deleteMessage: (messageId: string) => void;
  displayedUser: User | null;
  authToken: AuthToken;
}

export class UserInfoPresenter {
  private service: FollowService;
  private view: UserInfoView;

  constructor(view: UserInfoView) {
    this.service = new FollowService();
    this.view = view;
  }

  async initFollowData(
    authToken: AuthToken,
    currentUser: User,
    displayedUser: User
  ): Promise<[boolean, number, number]> {
    const isFollowing = await this.service.getIsFollowerStatus(
      authToken,
      displayedUser,
      displayedUser
    );
    const followerCount = await this.service.getFollowerCount(
      authToken,
      displayedUser
    );
    const foloweeCount = await this.service.getFolloweeCount(
      authToken,
      displayedUser
    );
    return [isFollowing, followerCount, foloweeCount];
  }

  //   setNumbFollowees = async (authToken: AuthToken, displayedUser: User) => {
  //     try {
  //       this._followeeCount = await this.service.getFolloweeCount(
  //         authToken,
  //         displayedUser
  //       );
  //     } catch (error) {
  //       this.view.displayErrorMessage(
  //         `Failed to get followees count because of exception: ${error}`
  //       );
  //     }
  //   };

  //   async setNumbFollowers(authToken: AuthToken, displayedUser: User) {
  //     try {
  //       this._followerCount = await this.service.getFollowerCount(
  //         authToken,
  //         displayedUser
  //       );
  //     } catch (error) {
  //       this.view.displayErrorMessage(
  //         `Failed to get followers count because of exception: ${error}`
  //       );
  //     }
  //   }

  async followDisplayedUser(authToken: AuthToken, displayedUser: User) {
    let messageId = this.view.displayInfoMessage(
      `Following ${displayedUser.name}...`,
      0
    );
    const [_followerCount, _followeeCount] = await this.follow(
      authToken,
      displayedUser
    );
    this.view.deleteMessage(messageId);
    return [_followerCount, _followeeCount];
  }

  async follow(
    authToken: AuthToken,
    userToFollow: User
  ): Promise<[_followerCount: number, _followeeCount: number]> {
    // Pause so we can see the follow message. Remove when connected to the server
    await new Promise((f) => setTimeout(f, 2000));

    // TODO: Call the server

    const _followerCount = await this.service.getFollowerCount(
      authToken,
      userToFollow
    );
    const _followeeCount = await this.service.getFolloweeCount(
      authToken,
      userToFollow
    );

    return [_followerCount, _followeeCount];
  }

  async unfollowDisplayedUser(authToken: AuthToken, displayedUser: User) {
    let messageId = this.view.displayInfoMessage(
      `Unfollowing ${displayedUser.name}...`,
      0
    );
    const [_followerCount, _followeeCount] = await this.unfollow(
      authToken,
      displayedUser
    );
    this.view.deleteMessage(messageId);
    return [_followerCount, _followeeCount];
  }

  unfollow = async (
    authToken: AuthToken,
    userToUnfollow: User
  ): Promise<[_followerCount: number, _followeeCount: number]> => {
    // Pause so we can see the unfollow message. Remove when connected to the server
    await new Promise((f) => setTimeout(f, 2000));

    // TODO: Call the server

    const _followerCount = await this.service.getFollowerCount(
      authToken,
      userToUnfollow
    );
    const _followeeCount = await this.service.getFolloweeCount(
      authToken,
      userToUnfollow
    );

    return [_followerCount, _followeeCount];
  };

  getIsFollowerStatus(authToken: AuthToken, user: User, selectedUser: User) {
    return this.service.getIsFollowerStatus(authToken, user, selectedUser);
  }
}
