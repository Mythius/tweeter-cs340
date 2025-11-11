import { GetIsFollowerStatusRequest, GetIsFollowerStatusResponse, User } from "tweeter-shared";
import { FollowService } from "../../service/follow/FollowService";
import { BaseLambda } from "../BaseLambda";

class GetIsFollowerStatusLambda extends BaseLambda<GetIsFollowerStatusRequest, GetIsFollowerStatusResponse> {
    protected async execute(request: GetIsFollowerStatusRequest): Promise<GetIsFollowerStatusResponse> {
        const followService = new FollowService();
        const isFollower = await followService.getIsFollowerStatus(
            request.token,
            User.fromDto(request.user)!,
            User.fromDto(request.selectedUser)!
        );
        return {
            success: true,
            message: null,
            isFollower: isFollower
        };
    }
}

export const handler = async (request: GetIsFollowerStatusRequest): Promise<GetIsFollowerStatusResponse> => {
    return new GetIsFollowerStatusLambda().handleRequest(request);
};
