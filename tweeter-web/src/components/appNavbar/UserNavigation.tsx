import { useNavigate } from "react-router-dom";
import { useMessageActions } from "../toaster/MessageHooks";
import { useUserInfo, useUserInfoActions } from "../userInfo/UserInfoHooks";
import { useRef } from "react";
import NavigationPresenter, {
  NavigationView,
} from "../../presenter/NavigationPresenter";

export const useUserNavigation = (featurePath: string) => {
  const navigate = useNavigate();
  const { displayErrorMessage } = useMessageActions();
  const { displayedUser, authToken } = useUserInfo();
  const { setDisplayedUser } = useUserInfoActions();

  const view: NavigationView = {
    setDisplayedUser,
    displayErrorMessage,
    navigate,
    featurePath,
  };

  const navigationPresenter = useRef<NavigationPresenter | null>(null);
  if (!navigationPresenter.current) {
    navigationPresenter.current = new NavigationPresenter(view);
  }

  async function navigateToUser(event: React.MouseEvent): Promise<void> {
    event.preventDefault();
    await navigationPresenter.current!.navigateToUser(
      event.target!.toString(),
      authToken!,
      displayedUser!
    );
  }

  return { navigateToUser, getUser: navigationPresenter.current!.getUser };
};
