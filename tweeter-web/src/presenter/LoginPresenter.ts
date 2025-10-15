import { User, AuthToken } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { Presenter, View } from "./Presenter";

export interface LoginView extends View {
  setIsLoading: (loading: boolean) => unknown;
  navigate: (url: string) => unknown;
  updateUserInfo: (
    currentUser: User,
    displayedUser: User | null,
    authToken: AuthToken,
    remember: boolean
  ) => void;
}

export default class LoginPresenter extends Presenter<LoginView> {
  private userService: UserService = new UserService();
  async doLogin(
    alias: string,
    password: string,
    rememberMe: boolean,
    originalUrl: string | undefined
  ) {
    await this.doFailureReportingOperation(async () => {
      this.view.setIsLoading(true);

      const [user, authToken] = await this.userService.login(alias, password);

      this.view.updateUserInfo(user, user, authToken, rememberMe);

      if (!!originalUrl) {
        this.view.navigate(originalUrl);
      } else {
        this.view.navigate(`/feed/${user.alias}`);
      }
    }, "log user in");
    this.view.setIsLoading(false);
  }
}
