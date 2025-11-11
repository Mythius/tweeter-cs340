import { GetFollowCountRequest, GetFollowCountResponse, User } from "tweeter-shared";
import { FollowService } from "../../service/follow/FollowService";
import { BaseLambda } from "../BaseLambda";

class GetFollowerCountLambda extends BaseLambda<GetFollowCountRequest, GetFollowCountResponse> {
    protected async execute(request: GetFollowCountRequest): Promise<GetFollowCountResponse> {
        const followService = new FollowService();
        const count = await followService.getFollowerCount(
            request.token,
            User.fromDto(request.user)!
        );
        return {
            success: true,
            message: null,
            count: count
        };
    }
}

export const handler = async (request: GetFollowCountRequest): Promise<GetFollowCountResponse> => {
    return new GetFollowerCountLambda().handleRequest(request);
};
