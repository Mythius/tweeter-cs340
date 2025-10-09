import { UserService } from "../model.service/UserService";

export default class LoginPresenter {
  private userService: UserService = new UserService();
  public login = this.userService.login;
}
