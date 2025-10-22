import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { anything, instance, mock, verify } from "@typestrong/ts-mockito";
import { PostStatusPresenter } from "../../../src/presenter/PostStatusPresenter";
import PostStatus from "../../../src/components/postStatus/PostStatus";
import { AuthToken, User } from "tweeter-shared";
import * as UserInfoHooks from "../../../src/components/userInfo/UserInfoHooks";
import * as MessageHooks from "../../../src/components/toaster/MessageHooks";

describe("Login Component", () => {
  const mockUser = new User("Test", "User", "testuser", "imageUrl");
  const mockAuthToken = new AuthToken("token", Date.now());
  beforeAll(() => {
    jest.spyOn(UserInfoHooks, "useUserInfo").mockReturnValue({
      currentUser: mockUser,
      displayedUser: mockUser,
      authToken: mockAuthToken,
    });

    jest.spyOn(MessageHooks, "useMessageActions").mockReturnValue({
      displayInfoMessage: jest.fn(),
      displayErrorMessage: jest.fn(),
      deleteMessage: jest.fn(),
      deleteAllMessages: jest.fn(),
    });
  });
  it("Post Status and Clear buttons are both disabled", async () => {
    const { postStatusButton, clearButton } = renderPostStatusAndGetElements();
    expect(postStatusButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });
  it("enables Both buttons are enabled when the text field has text", async () => {
    const { postStatusButton, clearButton, user, textfield } =
      renderPostStatusAndGetElements();
    await user.type(textfield, "somepost");
    expect(postStatusButton).toBeEnabled();
    expect(clearButton).toBeEnabled();
  });

  it("Both buttons are disabled when the text field is cleared.", async () => {
    const { postStatusButton, clearButton, user, textfield } =
      renderPostStatusAndGetElements();
    await user.type(textfield, "somepost");
    expect(postStatusButton).toBeEnabled();
    expect(clearButton).toBeEnabled();

    await user.clear(textfield);
    expect(postStatusButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });

  it("calls the presenters login method with correct paramters when the sign in button is pressed", async () => {
    const mockPresenter = mock<PostStatusPresenter>();
    const mockPresenterInstance = instance(mockPresenter);
    const postText = "somepost";

    const { postStatusButton, clearButton, user, textfield } =
      renderPostStatusAndGetElements(mockPresenterInstance);
    await user.type(textfield, postText);
    await user.click(postStatusButton);

    verify(
      mockPresenter.submitPost(mockAuthToken, postText, mockUser)
    ).once();
  });
});

function renderPostStatus(presenter?: PostStatusPresenter) {
  return render(
    <MemoryRouter>
      {!!presenter ? (
        <PostStatus presenter={presenter}></PostStatus>
      ) : (
        <PostStatus></PostStatus>
      )}
    </MemoryRouter>
  );
}

function renderPostStatusAndGetElements(presenter?: PostStatusPresenter) {
  const user = userEvent.setup();
  renderPostStatus(presenter);

  const postStatusButton = screen.getByRole("button", { name: /PostStatus/i });
  const clearButton = screen.getByRole("button", { name: /Clear/i });
  const textfield = screen.getByLabelText("posttext");

  return { user, postStatusButton, clearButton, textfield };
}
