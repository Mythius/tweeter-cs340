import { AuthToken, Status, User } from "tweeter-shared";
import { PostService } from "../model.service/PostService";
import { MessageView, Presenter } from "./Presenter";

export interface PostStatusView extends MessageView {
  setIsLoading: (a: boolean) => void;
  setPost: (str: string) => void;
}

export class PostStatusPresenter extends Presenter<PostStatusView> {
  private postService: PostService;

  constructor(v: PostStatusView) {
    super(v);
    this.postService = new PostService();
  }

  public get service() {
    return this.postService;
  }

  public set service(service: PostService) {
    this.postService = service;
  }

  async submitPost(authToken: AuthToken, post: string, currentUser: User) {
    var postingStatusToastId = "";
    await this.doFailureReportingOperation(async () => {
      this.view.setIsLoading(true);
      postingStatusToastId = this.view.displayInfoMessage(
        "Posting status...",
        0
      );

      const status = new Status(post, currentUser!, Date.now());

      await this.service.postStatus(authToken!, status);
      this.view.displayInfoMessage("Status posted!", 2000);
      this.view.setPost("");
    }, "post the status");

    this.view.deleteMessage(postingStatusToastId);
    this.view.setIsLoading(false);
  }
}
