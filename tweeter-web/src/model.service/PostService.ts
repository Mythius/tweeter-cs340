import { AuthToken, Status } from "tweeter-shared";
import { Service } from "./Service";
import { ServerFacade } from "./ServerFacade";

export class PostService implements Service  {
  private serverFacade = new ServerFacade();

  async postStatus(authToken: AuthToken, newStatus: Status): Promise<void> {
    const request = {
      token: authToken.token,
      newStatus: newStatus.dto,
    };
    await this.serverFacade.postStatus(request);
  }
}
