import { PostService } from "../model.service/PostService";

export interface PostStatusView {}

export class PostStatusPresenter {
  private postService: PostService = new PostService();
  public postStatus = this.postService.postStatus;
}
