import { MemoryRouter } from "react-router-dom";
import Login from "../../../../src/components/authentication/login/Login";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
import { anything, instance, mock, verify } from "@typestrong/ts-mockito";
import LoginPresenter from "../../../../src/presenter/LoginPresenter";

library.add(fab);

describe("Login Component", () => {
  it("starts with the sign in button disabled", () => {
    const { signInButton } = renderLoginAndGetElements("/");
    expect(signInButton).toBeDisabled();
  });

  it("enables the sign in button if both alias and password fileds have text", async () => {
    const { signInButton, aliasField, passwordField, user } =
      renderLoginAndGetElements("/");
    await user.type(aliasField, "a");
    await user.type(passwordField, "a");
    expect(signInButton).toBeEnabled();
  });

  it("disables the sign in button if either the alias or passord field is cleared", async () => {
    const { signInButton, aliasField, passwordField, user } =
      renderLoginAndGetElements("/");
    await user.type(aliasField, "a");
    await user.type(passwordField, "a");
    expect(signInButton).toBeEnabled();
    await user.clear(aliasField);
    expect(signInButton).toBeDisabled();
    await user.type(aliasField, "a");
    expect(signInButton).toBeEnabled();
    await user.clear(passwordField);
    expect(signInButton).toBeDisabled();
  });

  it("calls the presenters login method with correct paramters when the sign in button is pressed", async () => {
    const mockPresenter = mock<LoginPresenter>();

    const originalUrl = '/http://somewhere.com';

    const mockPresenterInstance = instance(mockPresenter);
    const { signInButton, aliasField, passwordField, user } = renderLoginAndGetElements(
      originalUrl,
      mockPresenterInstance
    );

    const useralias = 'matthias';
    const password = 'password';

    await user.type(aliasField,useralias);
    await user.type(passwordField,password);
    await user.click(signInButton);

    verify(mockPresenter.doLogin(useralias,password,anything(),originalUrl)).once();

  });
});

function renderLogin(originalUrl: string, presenter?: LoginPresenter) {
  return render(
    <MemoryRouter>
      {!!presenter ? (
        <Login presenter={presenter} originalUrl={originalUrl}></Login>
      ) : (
        <Login originalUrl={originalUrl}></Login>
      )}
    </MemoryRouter>
  );
}

function renderLoginAndGetElements(originalUrl: string,  presenter?: LoginPresenter) {
  const user = userEvent.setup();
  renderLogin(originalUrl, presenter);

  const signInButton = screen.getByRole("button", { name: /Sign In/i });
  const aliasField = screen.getByLabelText("alias");
  const passwordField = screen.getByLabelText("password");

  return { user, signInButton, aliasField, passwordField };
}
