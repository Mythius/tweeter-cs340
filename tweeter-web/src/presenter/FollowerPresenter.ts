import { AuthToken } from "tweeter-shared";
import { FollowService } from "../model.service/FollowService";
import { UserItemPresenter, UserItemView } from "./UserItemPresenter";

export const PAGE_SIZE = 10;

export class FollowerPresenter extends UserItemPresenter {
  private service: FollowService;

  constructor(view: UserItemView) {
    super(view);
    this.service = new FollowService();
  }

  loadMoreItems = async (authToken: AuthToken, userAlias: string) => {
    this.doFailureReportingOperation(async () => {
      const [newItems, hasMore] = await this.service.loadMoreFollowers(
        authToken,
        userAlias,
        PAGE_SIZE,
        this.lastItem
      );

      this.hasMoreItems = hasMore;
      this.lastItem =
        newItems.length > 0 ? newItems[newItems.length - 1] : null;
      this.view.addItems(newItems);
    }, "load followers");
  };
}
