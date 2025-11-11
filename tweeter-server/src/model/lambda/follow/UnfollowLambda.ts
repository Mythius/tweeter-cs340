import { FollowRequest, TweeterResponse, User } from "tweeter-shared";
import { FollowService } from "../../service/follow/FollowService";
import { BaseLambda } from "../BaseLambda";

class UnfollowLambda extends BaseLambda<FollowRequest, TweeterResponse> {
    protected async execute(request: FollowRequest): Promise<TweeterResponse> {
        if (!request.user) {
            throw new Error("[bad-request] User to unfollow cannot be empty");
        }
        if (!request.user.alias || request.user.alias.trim() === "") {
            throw new Error("[bad-request] User alias cannot be empty");
        }

        const followService = new FollowService();
        await followService.unfollow(
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
    return new UnfollowLambda().handleRequest(request);
};
