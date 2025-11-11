import type { RegisterRequest, AuthenticateResponse } from "tweeter-shared";
import { TweeterResponse } from "tweeter-shared";
import { UserService } from "../../service/user/UserService";

export const handler = async (request: RegisterRequest): Promise<AuthenticateResponse | TweeterResponse> => {
    try {
        if (!request.firstName || request.firstName.trim() === "") {
            throw new Error("[bad-request] First name cannot be empty");
        }
        if (!request.lastName || request.lastName.trim() === "") {
            throw new Error("[bad-request] Last name cannot be empty");
        }
        if (!request.alias || request.alias.trim() === "") {
            throw new Error("[bad-request] Username cannot be empty");
        }
        if (!request.password || request.password.trim() === "") {
            throw new Error("[bad-request] Password cannot be empty");
        }
        if (!request.userImageBytes || request.userImageBytes.trim() === "") {
            throw new Error("[bad-request] User image is required");
        }
        if (!request.imageFileExtension || request.imageFileExtension.trim() === "") {
            throw new Error("[bad-request] Image file extension is required");
        }

        const userService = new UserService();
        const [user, token] = await userService.register(
            request.firstName,
            request.lastName,
            request.alias,
            request.password,
            request.userImageBytes,
            request.imageFileExtension
        );
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
