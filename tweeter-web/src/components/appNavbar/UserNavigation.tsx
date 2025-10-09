import { useNavigate } from "react-router-dom";
import { useMessageActions } from "../toaster/MessageHooks";
import { useUserInfo, useUserInfoActions } from "../userInfo/UserInfoHooks";
import { useRef } from "react";
import NavigationPresenter from "../../presenter/NavigationPresenter";

export const useUserNavigation = (featurePath: string) => {
  const navigate = useNavigate();
  const { displayErrorMessage } = useMessageActions();
  const { displayedUser, authToken } = useUserInfo();
  const { setDisplayedUser } = useUserInfoActions();

  const navigationPresenter = useRef<NavigationPresenter | null>(null);
  if (!navigationPresenter.current) {
    navigationPresenter.current = new NavigationPresenter();
  }

  const navigateToUser = async (event: React.MouseEvent): Promise<void> => {
    event.preventDefault();

    try {
      const alias = extractAlias(event.target.toString());

      const toUser = await navigationPresenter.current!.getUser(
        authToken!,
        alias
      );

      if (toUser) {
        if (!toUser.equals(displayedUser!)) {
          setDisplayedUser(toUser);
          navigate(`${featurePath}/${toUser.alias}`);
        }
      }
    } catch (error) {
      displayErrorMessage(`Failed to get user because of exception: ${error}`);
    }
  };

  const extractAlias = (value: string): string => {
    const index = value.indexOf("@");
    return value.substring(index);
  };

  return { navigateToUser, getUser: navigationPresenter.current!.getUser };
};
