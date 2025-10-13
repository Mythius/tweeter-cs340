import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { Presenter, View } from "./Presenter";

export interface NavigationView extends View {
  setDisplayedUser: (user: User) => void;
  navigate: (url: string) => void;
  featurePath: string;
}

export default class NavigationPresenter extends Presenter<NavigationView> {
  private userService: UserService = new UserService();
  constructor(view: NavigationView) {
    super(view);
  }

  async navigateToUser(
    aliasdata: string,
    authToken: AuthToken,
    displayedUser: User
  ): Promise<void> {
    this.doFailureReportingOperation(async () => {
      const alias = this.extractAlias(aliasdata);

      const toUser = await this.userService.getUser(authToken!, alias);

      if (toUser) {
        if (!toUser.equals(displayedUser!)) {
          this.view.setDisplayedUser(toUser);
          this.view.navigate(`${this.view.featurePath}/${toUser.alias}`);
        }
      }
    }, "get user");
  }

  extractAlias(value: string): string {
    const index = value.indexOf("@");
    return value.substring(index);
  }

  getUser = this.userService.getUser;
}
