import { UserService } from "../model.service/UserService";

export default class NavigationPresenter {
  private userService: UserService = new UserService();
  public getUser = this.userService.getUser;
}
