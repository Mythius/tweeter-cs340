import { AuthToken, User } from "tweeter-shared";
import { UserItemPresenter } from "./UserItemPresenter";
import { PAGE_SIZE } from "./PagedItemPresenter";

export class FollowerPresenter extends UserItemPresenter {
  protected getOperationDescription(): string {
    return "load followers";
  }
  protected getMoreItems(
    authToken: AuthToken,
    userAlias: string
  ): Promise<[newItems: User[], hasMore: boolean]> {
    return this.service.loadMoreFollowers(
      authToken,
      userAlias,
      PAGE_SIZE,
      this.lastItem
    );
  }
}
