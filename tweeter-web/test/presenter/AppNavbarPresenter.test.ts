import { AuthToken } from "tweeter-shared";
import {
  AppNavbarPresenter,
  AppNavbarView,
} from "../../src/presenter/AppNavbarPresenter";
import {
  anything,
  capture,
  instance,
  mock,
  spy,
  verify,
  when,
} from "@typestrong/ts-mockito";
import { UserService } from "../../src/model.service/UserService";

describe("AppNavbarPresenter", () => {
  let mockAppNavbarPresenterView: AppNavbarView;
  let appNavbarPresenter: AppNavbarPresenter;
  let mockService: UserService;

  const authToken = new AuthToken("abc123", Date.now());

  beforeEach(() => {
    mockAppNavbarPresenterView = mock<AppNavbarView>();
    const mockAppNavbarPresenterViewInstance = instance(
      mockAppNavbarPresenterView
    );
    when(mockAppNavbarPresenterView.displayInfoMessage(anything(), 0)).thenReturn('messageId123');

    const appNavbarPresenterSpy = spy(
      new AppNavbarPresenter(mockAppNavbarPresenterViewInstance)
    );
    appNavbarPresenter = instance(appNavbarPresenterSpy);

    mockService = mock<UserService>();
    when(appNavbarPresenterSpy.service).thenReturn(instance(mockService));
  });

  it("tells the view to display a logging out message", async () => {
    await appNavbarPresenter.logOut(authToken);
    verify(
      mockAppNavbarPresenterView.displayInfoMessage("Logging Out...", 0)
    ).once();
  });

  it("calls logout on the user service with the correct auth token", async () => {
    await appNavbarPresenter.logOut(authToken);
    verify(mockService.logout(authToken)).once();
  });

  it("tells the view to clear in the info message that was displayed, clears user info and navigates to login page when successfull", async () => {
    await appNavbarPresenter.logOut(authToken);
    
    verify(mockAppNavbarPresenterView.displayErrorMessage(anything())).never();
    verify(mockAppNavbarPresenterView.deleteMessage(anything())).once();
    verify(mockAppNavbarPresenterView.clearUserInfo()).once();
    verify(mockAppNavbarPresenterView.navigateToLogin()).once();
  });

  it("tells the view to display an error message, doesn't clear it and dosn't navigate",async ()=>{
    when(mockService.logout).thenThrow(new Error("Testing Logout Failure"));
    await appNavbarPresenter.logOut(authToken);
    verify(mockAppNavbarPresenterView.displayErrorMessage('Failed to log user out because of exception: Testing Logout Failure')).once();
    verify(mockAppNavbarPresenterView.deleteMessage('messageId123')).never();
    verify(mockAppNavbarPresenterView.clearUserInfo()).never();
    verify(mockAppNavbarPresenterView.navigateToLogin()).never();
  });
});
