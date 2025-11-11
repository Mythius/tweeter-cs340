import type { LoginRequest, AuthenticateResponse } from "tweeter-shared";
import { TweeterResponse } from "tweeter-shared";
import { UserService } from "../../service/user/UserService";

export const handler = async (request: LoginRequest): Promise<AuthenticateResponse | TweeterResponse> => {
    try {
        if (!request.alias || request.alias.trim() === "") {
            throw new Error("[bad-request] Username cannot be empty");
        }
        if (!request.password || request.password.trim() === "") {
            throw new Error("[bad-request] Password cannot be empty");
        }

        const userService = new UserService();
        const [user, token] = await userService.login(request.alias, request.password);
        return {
            success: true,
            message: null,
            user: user,
            token: token
        } as AuthenticateResponse;
    } catch (error) {
        console.error("[Lambda Error]", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "An unknown error occurred"
        } as TweeterResponse;
    }
};
