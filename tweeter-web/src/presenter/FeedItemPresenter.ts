import { AuthToken } from "tweeter-shared";
import { StatusService } from "../model.service/StatusService";
import { StatusItemPresenter } from "./StatusItemPresenter";

export class FeedItemPresenter extends StatusItemPresenter {
  private service: StatusService = new StatusService();
}
