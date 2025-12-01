import { User, AuthToken } from "tweeter-shared";
import { Presenter, View } from "./Presenter";

export interface AuthenticationView extends View {
  setIsLoading: (loading: boolean) => unknown;
  navigate: (url: string) => unknown;
  updateUserInfo: (
    currentUser: User,
    displayedUser: User | null,
    authToken: AuthToken,
    remember: boolean
  ) => void;
}

export default abstract class AuthenticationPresenter<
  V extends AuthenticationView
> extends Presenter<V> {
  async doAuthenticationOperation(
    doLoginOrRegister: () => Promise<[User, AuthToken]>,
    rememberMe: boolean,
    originalUrl: string | undefined
  ) {
    await this.doFailureReportingOperation(async () => {
      this.view.setIsLoading(true);
      const [user, authToken] = await doLoginOrRegister();
      this.view.updateUserInfo(user, user, authToken, rememberMe);
      this.doNavigate(user, originalUrl);
    }, "authenticate user");
    this.view.setIsLoading(false);
  }
  abstract doNavigate(user: User, originalUrl: string | undefined): void;
}
