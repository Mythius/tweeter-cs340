import { AuthToken, User } from "tweeter-shared";
import { FollowService } from "../model.service/FollowService";
import { MessageView, Presenter } from "./Presenter";

export interface UserInfoView extends MessageView {
  currentUser: User | null;
  displayedUser: User | null;
  authToken: AuthToken;
}

export class UserInfoPresenter extends Presenter<MessageView> {
  private service: FollowService = new FollowService();

  async initFollowData(
    authToken: AuthToken,
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

  async doFollowOperation(
    authToken: AuthToken,
    displayedUser: User,
    follow: boolean
  ): Promise<[_followerCount: number, _followeeCount: number]> {
    if (follow) {
      await this.service.follow(authToken, displayedUser);
    } else {
      await this.service.unfollow(authToken, displayedUser);
    }
    const followerCount = await this.service.getFollowerCount(
      authToken,
      displayedUser
    );
    const foloweeCount = await this.service.getFolloweeCount(
      authToken,
      displayedUser
    );
    return [followerCount, foloweeCount];
  }

  async doFollowDisplayedUser(
    authToken: AuthToken,
    displayedUser: User,
    follow: boolean
  ) {
    let messageId = this.view.displayInfoMessage(
      `${follow ? "Following" : "Unfollowing"} ${displayedUser.name}...`,
      0
    );
    if (follow) {
      await this.follow(authToken, displayedUser);
    } else {
      await this.unfollow(authToken, displayedUser);
    }
    const [_followerCount, _followeeCount] = await this.doFollowOperation(
      authToken,
      displayedUser,
      follow
    );
    this.view.deleteMessage(messageId);
    return [_followerCount, _followeeCount];
  }

  async followDisplayedUser(authToken: AuthToken, displayedUser: User) {
    return await this.doFollowDisplayedUser(authToken, displayedUser, true);
  }

  async follow(
    authToken: AuthToken,
    userToFollow: User
  ): Promise<[_followerCount: number, _followeeCount: number]> {
    return await this.doFollowOperation(authToken, userToFollow, true);
  }

  async unfollowDisplayedUser(authToken: AuthToken, displayedUser: User) {
    return await this.doFollowDisplayedUser(authToken, displayedUser, false);
  }

  async unfollow(
    authToken: AuthToken,
    userToUnfollow: User
  ): Promise<[_followerCount: number, _followeeCount: number]> {
    return await this.doFollowOperation(authToken, userToUnfollow, false);
  }

  getIsFollowerStatus(authToken: AuthToken, user: User, selectedUser: User) {
    return this.service.getIsFollowerStatus(authToken, user, selectedUser);
  }
}
