import { AuthToken, Status } from "tweeter-shared";
import { StatusItemPresenter } from "./StatusItemPresenter";
import { PAGE_SIZE } from "./PagedItemPresenter";

export class FeedItemPresenter extends StatusItemPresenter {
  protected getOperationDescription(): string {
    return "load feed";
  }
  protected getMoreItems(
    authToken: AuthToken,
    userAlias: string
  ): Promise<[newItems: Status[], hasMore: boolean]> {
    return this.service.loadMoreFeedItems(
      authToken,
      userAlias,
      PAGE_SIZE,
      this.lastItem
    );
  }

}
