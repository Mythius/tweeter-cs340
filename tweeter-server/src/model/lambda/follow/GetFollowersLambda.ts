import { PagedUserItemRequest, PagedUserItemResponse } from "tweeter-shared";
import { FollowService } from "../../service/follow/FollowService";
import { BaseLambda } from "../BaseLambda";

class GetFollowersLambda extends BaseLambda<PagedUserItemRequest, PagedUserItemResponse> {
    protected async execute(request: PagedUserItemRequest): Promise<PagedUserItemResponse> {
        const followService = new FollowService();
        const [items, hasMore] = await followService.loadMoreFollowers(
            request.token,
            request.userAlias,
            request.pageSize,
            request.lastItem
        );
        return {
            success: true,
            message: null,
            items: items,
            hasMore: hasMore
        };
    }
}

export const handler = async (request: PagedUserItemRequest): Promise<PagedUserItemResponse> => {
    return new GetFollowersLambda().handleRequest(request);
};
