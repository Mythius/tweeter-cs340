import { AuthToken, User } from "tweeter-shared";
import { Presenter, View } from "./Presenter";
import { UserService } from "../model.service/UserService";
import { Service } from "../model.service/Service";

export const PAGE_SIZE = 10;

export interface PagedItemView<T> extends View {
  addItems: (newItem: T[]) => void;
}

export abstract class PagedItemPresenter<
  T,
  U extends Service
> extends Presenter<PagedItemView<T>> {
  private userService: UserService = new UserService();
  private _hasMoreItems = true;
  private _lastItem: T | null = null;
  private _service: U;

  protected constructor(view: PagedItemView<T>) {
    super(view);
    this._service = this.serviceFactory();
  }

  protected get lastItem() {
    return this._lastItem;
  }
  protected set lastItem(value: T | null) {
    this._lastItem = value;
  }
  protected set hasMoreItems(value: boolean) {
    this._hasMoreItems = value;
  }
  public get hasMoreItems() {
    return this._hasMoreItems;
  }
  reset() {
    this._lastItem = null;
    this._hasMoreItems = true;
  }
  async loadMoreItems(authToken: AuthToken, userAlias: string) {
    this.doFailureReportingOperation(async () => {
      const [newItems, hasMore] = await this.getMoreItems(authToken, userAlias);

      this.hasMoreItems = hasMore;
      this.lastItem =
        newItems.length > 0 ? newItems[newItems.length - 1] : null;
      this.view.addItems(newItems);
    }, this.getOperationDescription());
  }
  async getUser(authToken: AuthToken, alias: string): Promise<User | null> {
    return this.userService.getUser(authToken, alias);
  }
  protected abstract serviceFactory(): U;
  protected abstract getOperationDescription(): string;
  protected abstract getMoreItems(
    authToken: AuthToken,
    userAlias: string
  ): Promise<[newItems: T[], hasMore: boolean]>;
  protected get service() {
    return this._service;
  }
}
