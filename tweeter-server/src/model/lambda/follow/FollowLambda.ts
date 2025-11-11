import { FollowRequest, TweeterResponse, User } from "tweeter-shared";
import { FollowService } from "../../service/follow/FollowService";
import { BaseLambda } from "../BaseLambda";

class FollowLambda extends BaseLambda<FollowRequest, TweeterResponse> {
    protected async execute(request: FollowRequest): Promise<TweeterResponse> {
        const followService = new FollowService();
        await followService.follow(
            request.token,
            User.fromDto(request.user)!
        );
        return {
            success: true,
            message: null
        };
    }
}

export const handler = async (request: FollowRequest): Promise<TweeterResponse> => {
    return new FollowLambda().handleRequest(request);
};
