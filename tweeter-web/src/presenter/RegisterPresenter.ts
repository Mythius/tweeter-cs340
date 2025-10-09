import { UserService } from "../model.service/UserService";

export default class RegisterPresenter {
  private userService: UserService = new UserService();
  public register = this.userService.register;
}
