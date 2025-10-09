import { StatusService } from "../model.service/StatusService";

export default class AppPresenter {
  private statusService: StatusService = new StatusService();
  public loadMoreFeedItems = this.statusService.loadMoreFeedItems;
  public loadMoreStoryItems = this.statusService.loadMoreStoryItems;
}
