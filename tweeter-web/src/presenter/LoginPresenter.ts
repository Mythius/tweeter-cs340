import { User, AuthToken } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { Presenter, View } from "./Presenter";
import AuthenticationPresenter, {
  AuthenticationView,
} from "./AuthenticationPresenter";

export default class LoginPresenter extends AuthenticationPresenter<AuthenticationView> {
  private userService: UserService = new UserService();
  async doLogin(
    alias: string,
    password: string,
    rememberMe: boolean,
    originalUrl: string | undefined
  ) {
    this.doAuthenticationOperation(
      async () => {
        return await this.userService.login(alias, password);
      },
      rememberMe,
      originalUrl
    );
  }

  doNavigate(user: User, originalUrl: string | undefined) {
    if (!!originalUrl) {
      this.view.navigate(originalUrl);
    } else {
      this.view.navigate(`/feed/${user.alias}`);
    }
  }
}
