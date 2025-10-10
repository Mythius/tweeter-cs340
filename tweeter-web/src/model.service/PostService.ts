import { AuthToken, Status } from "tweeter-shared";

export class PostService {
  async postStatus(authToken: AuthToken, newStatus: Status): Promise<void> {
    // Pause so we can see the logging out message. Remove when connected to the server
    await new Promise((f) => setTimeout(f, 2000));

    // TODO: Call the server to post the status
  }
}
