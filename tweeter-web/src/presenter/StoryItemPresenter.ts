import { AuthToken } from "tweeter-shared";
import { StatusService } from "../model.service/StatusService";
import { StatusItemPresenter } from "./StatusItemPresenter";

export class StoryItemPresenter extends StatusItemPresenter {
  private service: StatusService = new StatusService();
}
