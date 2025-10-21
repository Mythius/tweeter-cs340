import {
  anything,
  capture,
  instance,
  mock,
  spy,
  verify,
  when,
} from "@typestrong/ts-mockito";
import { PostService } from "../../src/model.service/PostService";
import {
  PostStatusPresenter,
  PostStatusView,
} from "../../src/presenter/PostStatusPresenter";
import { AuthToken, User } from "tweeter-shared";

describe("PostStatusPresenter", () => {
  let mockPostStatusPresenterView: PostStatusView;
  let postStatusPresenter: PostStatusPresenter;
  let mockService: PostService;

  const authToken = new AuthToken("test", Date.now());
  const user = new User("matthias", "southwick", "something", "");
  const post = "test post content";

  beforeEach(() => {
    mockPostStatusPresenterView = mock<PostStatusView>();
    const mockPostStatusPresenterViewInstance = instance(
      mockPostStatusPresenterView
    );

    when(
      mockPostStatusPresenterView.displayInfoMessage(anything(), anything())
    ).thenReturn("toast-id");
    when(mockPostStatusPresenterView.setIsLoading(anything())).thenReturn();
    when(mockPostStatusPresenterView.setPost(anything())).thenReturn();
    when(mockPostStatusPresenterView.deleteMessage(anything())).thenReturn();

    const postStatusPresenterSpy = spy(
      new PostStatusPresenter(mockPostStatusPresenterViewInstance)
    );

    postStatusPresenter = instance(postStatusPresenterSpy);

    mockService = mock<PostService>();
    const mockServiceInstance = instance(mockService);

    when(postStatusPresenterSpy.service).thenReturn(mockServiceInstance);
  });

  it("tells the view to display a posting status message", async () => {
    await postStatusPresenter.submitPost(authToken, post, user);
    verify(
      mockPostStatusPresenterView.displayInfoMessage("Posting status...", 0)
    ).once();
  });

  it("calls postStatus on the post status service with the correct status string and auth token", async () => {
    await postStatusPresenter.submitPost(authToken, post, user);

    verify(mockService.postStatus(authToken, anything())).once();

    const [capturedAuthToken, capturedStatus] = capture(
      mockService.postStatus
    ).last();
    expect(capturedAuthToken).toBe(authToken);
    expect(capturedStatus.post).toBe(post);
    expect(capturedStatus.user).toBe(user);
    expect(capturedStatus.timestamp).toBeDefined();
  });

  it("when posting of the status is successful, the presenter tells the view to clear the info message that was displayed previously, clear the post, and display a status posted message", async () => {
    await postStatusPresenter.submitPost(authToken, post, user);

    verify(mockPostStatusPresenterView.deleteMessage("toast-id")).once();

    verify(mockPostStatusPresenterView.setPost("")).once();

    verify(
      mockPostStatusPresenterView.displayInfoMessage("Status posted!", 2000)
    ).once();
  });

  it("when posting of the status is not successful, the presenter tells the view to clear the info message and display an error message but does not tell it to clear the post or display a status posted message", async () => {
    const errorMessage = "Failed to post";
    when(mockService.postStatus(anything(), anything())).thenThrow(
      new Error(errorMessage)
    );

    await postStatusPresenter.submitPost(authToken, post, user);

    verify(mockPostStatusPresenterView.deleteMessage("toast-id")).once();

    verify(
      mockPostStatusPresenterView.displayErrorMessage(
        `Failed to post the status because of exception: ${errorMessage}`
      )
    ).once();

    verify(mockPostStatusPresenterView.setPost("")).never();

    verify(
      mockPostStatusPresenterView.displayInfoMessage("Status posted!", 2000)
    ).never();
  });
});
