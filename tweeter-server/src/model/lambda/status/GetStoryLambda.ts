import type { PagedStatusItemRequest, PagedStatusItemResponse } from "tweeter-shared";
import { StatusService } from "../../service/status/StatusService";
import { BaseLambda } from "../BaseLambda";

class GetStoryLambda extends BaseLambda<PagedStatusItemRequest, PagedStatusItemResponse> {
    protected async execute(request: PagedStatusItemRequest): Promise<PagedStatusItemResponse> {
        const statusService = new StatusService();
        const [items, hasMore] = await statusService.loadMoreStoryItems(
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

export const handler = async (request: PagedStatusItemRequest): Promise<PagedStatusItemResponse> => {
    return new GetStoryLambda().handleRequest(request);
};
