import { TweeterRequest, TweeterResponse } from "tweeter-shared";
import { UserService } from "../../service/user/UserService";
import { BaseLambda } from "../BaseLambda";

class LogoutLambda extends BaseLambda<TweeterRequest, TweeterResponse> {
    protected async execute(request: TweeterRequest): Promise<TweeterResponse> {
        const userService = new UserService();
        await userService.logout(request.token);
        return {
            success: true,
            message: null
        };
    }
}

export const handler = async (request: TweeterRequest): Promise<TweeterResponse> => {
    return new LogoutLambda().handleRequest(request);
};
