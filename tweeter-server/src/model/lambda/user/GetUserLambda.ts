import type { GetUserRequest, GetUserResponse } from "tweeter-shared";
import { UserService } from "../../service/user/UserService";
import { BaseLambda } from "../BaseLambda";

class GetUserLambda extends BaseLambda<GetUserRequest, GetUserResponse> {
    protected async execute(request: GetUserRequest): Promise<GetUserResponse> {
        const userService = new UserService();
        const user = await userService.getUser(request.token, request.alias);
        return {
            success: true,
            message: null,
            user: user
        };
    }
}

export const handler = async (request: GetUserRequest): Promise<GetUserResponse> => {
    return new GetUserLambda().handleRequest(request);
};
