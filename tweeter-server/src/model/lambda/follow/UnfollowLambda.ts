import { FollowRequest, TweeterResponse, User } from "tweeter-shared";
import { FollowService } from "../../service/follow/FollowService";
import { BaseLambda } from "../BaseLambda";

class UnfollowLambda extends BaseLambda<FollowRequest, TweeterResponse> {
    protected async execute(request: FollowRequest): Promise<TweeterResponse> {
        const followService = new FollowService();
        await followService.unfollow(
            request.token,
            User.fromDto(request.userToFollow)!
        );
        return {
            success: true,
            message: null
        };
    }
}

export const handler = async (request: FollowRequest): Promise<TweeterResponse> => {
    return new UnfollowLambda().handleRequest(request);
};
