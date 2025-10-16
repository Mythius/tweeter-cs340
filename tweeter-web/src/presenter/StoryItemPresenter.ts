import { AuthToken, Status } from "tweeter-shared";
import { StatusItemPresenter } from "./StatusItemPresenter";
import { PAGE_SIZE } from "./PagedItemPresenter";

export class StoryItemPresenter extends StatusItemPresenter {
  protected getOperationDescription(): string {
    return "load story";
  }
  protected getMoreItems(
    authToken: AuthToken,
    userAlias: string
  ): Promise<[newItems: Status[], hasMore: boolean]> {
    return this.service.loadMoreStoryItems(
      authToken,
      userAlias,
      PAGE_SIZE,
      this.lastItem
    );
  }
}
