import { Buffer } from "buffer";
import { AuthToken, User } from "tweeter-shared";
import { Service } from "./Service";
import { ServerFacade } from "./ServerFacade";

export class UserService implements Service {
  private serverFacade = new ServerFacade();

  async getUser(authToken: AuthToken, alias: string): Promise<User | null> {
    const request = {
      token: authToken.token,
      alias: alias,
    };
    return await this.serverFacade.getUser(request);
  }

  async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    userImageBytes: Uint8Array,
    imageFileExtension: string
  ): Promise<[User, AuthToken]> {
    const imageStringBase64: string =
      Buffer.from(userImageBytes).toString("base64");

    const request = {
      firstName: firstName,
      lastName: lastName,
      alias: alias,
      password: password,
      userImageBytes: imageStringBase64,
      imageFileExtension: imageFileExtension,
    };

    return await this.serverFacade.register(request);
  }

  async login(alias: string, password: string): Promise<[User, AuthToken]> {
    const request = {
      alias: alias,
      password: password,
    };
    return await this.serverFacade.login(request);
  }

  async logout(authToken: AuthToken): Promise<void> {
    await this.serverFacade.logout(authToken);
  }
}
