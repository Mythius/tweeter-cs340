import { FakeData, Status } from "tweeter-shared";
import type { StatusDto } from "tweeter-shared";

export class StatusService {
    public async loadMoreFeedItems(
        token: string,
        userAlias: string,
        pageSize: number,
        lastItem: StatusDto | null
    ): Promise<[StatusDto[], boolean]> {
        // TODO: Validate token, fetch from database
        const [items, hasMore] = FakeData.instance.getPageOfStatuses(
            Status.fromDto(lastItem),
            pageSize
        );
        return [items.map(status => status.dto), hasMore];
    }

    public async loadMoreStoryItems(
        token: string,
        userAlias: string,
        pageSize: number,
        lastItem: StatusDto | null
    ): Promise<[StatusDto[], boolean]> {
        // TODO: Validate token, fetch from database
        const [items, hasMore] = FakeData.instance.getPageOfStatuses(
            Status.fromDto(lastItem),
            pageSize
        );
        return [items.map(status => status.dto), hasMore];
    }
}
