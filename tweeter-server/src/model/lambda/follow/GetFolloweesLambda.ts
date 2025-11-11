import { Follow, PagedUserItemRequest } from "tweeter-shared";
import { PagedUserItemResponse } from "tweeter-shared";
import { FollowService } from "../../service/follow/FollowService";

export const handler = async (request: PagedUserItemRequest): Promise<PagedUserItemResponse> => {
    const followService = new FollowService();
    const [items, hasMore] = await followService.loadMoreFollowees(
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
    }
};
