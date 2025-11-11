import { AuthToken, Status } from "tweeter-shared";
import { Service } from "./Service";
import { ServerFacade } from "./ServerFacade";

export class StatusService implements Service {
  private serverFacade = new ServerFacade();

  async loadMoreFeedItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null
  ): Promise<[Status[], boolean]> {
    const request = {
      token: authToken.token,
      userAlias: userAlias,
      pageSize: pageSize,
      lastItem: lastItem ? lastItem.dto : null,
    };
    return await this.serverFacade.getFeed(request);
  }

  async loadMoreStoryItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null
  ): Promise<[Status[], boolean]> {
    const request = {
      token: authToken.token,
      userAlias: userAlias,
      pageSize: pageSize,
      lastItem: lastItem ? lastItem.dto : null,
    };
    return await this.serverFacade.getStory(request);
  }
}
