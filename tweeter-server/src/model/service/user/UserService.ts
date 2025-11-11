import { AuthToken, FakeData, User, UserDto } from "tweeter-shared";

export class UserService {
    public async getUser(token: string, alias: string): Promise<UserDto | null> {
        // TODO: Validate token
        const user = FakeData.instance.findUserByAlias(alias);
        return user ? user.dto : null;
    }

    public async register(
        firstName: string,
        lastName: string,
        alias: string,
        password: string,
        userImageBytes: string,
        imageFileExtension: string
    ): Promise<[UserDto, string]> {
        // TODO: Upload image to S3, create user in database, generate token
        const user = FakeData.instance.firstUser!;
        const authToken = AuthToken.Generate();
        return [user.dto, authToken.token];
    }

    public async login(alias: string, password: string): Promise<[UserDto, string]> {
        // TODO: Validate credentials, generate token
        const user = FakeData.instance.firstUser!;
        const authToken = AuthToken.Generate();
        return [user.dto, authToken.token];
    }

    public async logout(token: string): Promise<void> {
        // TODO: Invalidate token in database
        await new Promise((res) => setTimeout(res, 1000));
    }
}
