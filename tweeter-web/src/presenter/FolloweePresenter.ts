import { AuthToken, User } from "tweeter-shared";
import { UserItemPresenter } from "./UserItemPresenter";
import { PAGE_SIZE } from "./PagedItemPresenter";

export class FolloweePresenter extends UserItemPresenter {
  protected getOperationDescription(): string {
    return "load followees";
  }
  protected getMoreItems(
    authToken: AuthToken,
    userAlias: string
  ): Promise<[newItems: User[], hasMore: boolean]> {
    return this.service.loadMoreFollowees(
      authToken,
      userAlias,
      PAGE_SIZE,
      this.lastItem
    );
  }
}
