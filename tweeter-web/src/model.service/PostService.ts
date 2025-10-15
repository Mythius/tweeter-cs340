import { AuthToken, Status } from "tweeter-shared";
import { Service } from "./Service";

export class PostService implements Service  {
  async postStatus(authToken: AuthToken, newStatus: Status): Promise<void> {
    // Pause so we can see the logging out message. Remove when connected to the server
    await new Promise((f) => setTimeout(f, 2000));

    // TODO: Call the server to post the status
  }
}
