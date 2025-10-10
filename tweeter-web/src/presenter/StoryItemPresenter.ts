import { AuthToken } from "tweeter-shared";
import { StatusService } from "../model.service/StatusService";
import { StatusItemPresenter, StatusItemView } from "./StatusItemPresenter";

export const PAGE_SIZE = 10;

export class StoryItemPresenter extends StatusItemPresenter {
  private service: StatusService;

  constructor(view: StatusItemView) {
    super(view);
    this.service = new StatusService();
  }

  async loadMoreItems(AuthToken: AuthToken, userAlias: string) {
    try {
      const [newItems, hasMore] = await this.service.loadMoreStoryItems(
        AuthToken,
        userAlias,
        PAGE_SIZE,
        this.lastItem
      );
      this.hasMoreItems = hasMore;
      this.lastItem =
        newItems.length > 0 ? newItems[newItems.length - 1] : null;
      this.view.addItems(newItems);
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to load Story items because of exception: ${error}`
      );
    }
  }
}
