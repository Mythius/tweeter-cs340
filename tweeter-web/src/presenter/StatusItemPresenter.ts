import { AuthToken, Status, User } from "tweeter-shared";
import { StatusService } from "../model.service/StatusService";
import { UserService } from "../model.service/UserService";
import { Presenter, View } from "./Presenter";

export interface StatusItemView extends View {
  addItems: (newItem: Status[]) => void;
}

export abstract class StatusItemPresenter extends Presenter<StatusItemView> {
  private _hasMoreItems = true;
  private _lastItem: Status | null = null;
  private statusService: StatusService;
  private userService: UserService;

  protected constructor(view: StatusItemView) {
    super(view);
    this.statusService = new StatusService();
    this.userService = new UserService();
  }
  protected get lastItem() {
    return this._lastItem;
  }
  protected set lastItem(value: Status | null) {
    this._lastItem = value;
  }
  protected set hasMoreItems(Status: boolean) {
    this._hasMoreItems = Status;
  }
  public get hasMoreItems() {
    return this._hasMoreItems;
  }
  reset() {
    this._lastItem = null;
    this._hasMoreItems = true;
  }
  abstract loadMoreItems(authToken: AuthToken, userAlias: string): void;
  async getUser(authToken: AuthToken, alias: string): Promise<User | null> {
    return this.userService.getUser(authToken, alias);
  }
}
