import "./Login.css";
import "bootstrap/dist/css/bootstrap.css";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthenticationFormLayout from "../AuthenticationFormLayout";
import AuthenticationFields from "../AuthenticationFields/AuthenticationFields";
import { useMessageActions } from "../../toaster/MessageHooks";
import { useUserInfoActions } from "../../userInfo/UserInfoHooks";
import LoginPresenter from "../../../presenter/LoginPresenter";

interface Props {
  originalUrl?: string;
}

const Login = (props: Props) => {
  const [alias, setAlias] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { updateUserInfo } = useUserInfoActions();
  const { displayErrorMessage } = useMessageActions();

  const loginPresenter = useRef<LoginPresenter | null>(null);
  if (!loginPresenter.current) {
    loginPresenter.current = new LoginPresenter();
  }

  const checkSubmitButtonStatus = (): boolean => {
    return !alias || !password;
  };

  const loginOnEnter = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key == "Enter" && !checkSubmitButtonStatus()) {
      doLogin();
    }
  };

  const doLogin = async () => {
    try {
      setIsLoading(true);

      const [user, authToken] = await loginPresenter.current!.login(
        alias,
        password
      );

      updateUserInfo(user, user, authToken, rememberMe);

      if (!!props.originalUrl) {
        navigate(props.originalUrl);
      } else {
        navigate(`/feed/${user.alias}`);
      }
    } catch (error) {
      displayErrorMessage(
        `Failed to log user in because of exception: ${error}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputFieldFactory = () => {
    return (
      <AuthenticationFields
        onEnter={loginOnEnter}
        setAlias={setAlias}
        setPassword={setPassword}
      ></AuthenticationFields>
    );
  };

  const switchAuthenticationMethodFactory = () => {
    return (
      <div className="mb-3">
        Not registered? <Link to="/register">Register</Link>
      </div>
    );
  };

  return (
    <AuthenticationFormLayout
      headingText="Please Sign In"
      submitButtonLabel="Sign in"
      oAuthHeading="Sign in with:"
      inputFieldFactory={inputFieldFactory}
      switchAuthenticationMethodFactory={switchAuthenticationMethodFactory}
      setRememberMe={setRememberMe}
      submitButtonDisabled={checkSubmitButtonStatus}
      isLoading={isLoading}
      submit={doLogin}
    />
  );
};

export default Login;
