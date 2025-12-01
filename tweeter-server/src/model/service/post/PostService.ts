import { Status } from "tweeter-shared";
import type { StatusDto } from "tweeter-shared";
import { IDAOFactory } from "../../dao/interface/IDAOFactory";
import { DynamoDAOFactory } from "../../dao/factory/DynamoDAOFactory";
import { IStatusDAO } from "../../dao/interface/IStatusDAO";
import { IFeedDAO } from "../../dao/interface/IFeedDAO";
import { IFollowDAO } from "../../dao/interface/IFollowDAO";
import { AuthorizationService } from "../auth/AuthorizationService";

export class PostService {
    private statusDAO: IStatusDAO;
    private feedDAO: IFeedDAO;
    private followDAO: IFollowDAO;
    private authService: AuthorizationService;

    constructor(daoFactory?: IDAOFactory) {
        const factory = daoFactory || DynamoDAOFactory.getInstance();
        this.statusDAO = factory.createStatusDAO();
        this.feedDAO = factory.createFeedDAO();
        this.followDAO = factory.createFollowDAO();
        this.authService = new AuthorizationService(factory);
    }

    public async postStatus(token: string, newStatus: StatusDto): Promise<void> {
        // Validate token
        await this.authService.validateToken(token);

        // Convert DTO to domain object
        const status = Status.fromDto(newStatus);
        if (!status) {
            throw new Error("[bad-request] Invalid status data");
        }

        // Save to Status table (user's story)
        await this.statusDAO.create(status);

        // Add to all followers' feeds
        const batchSize = 25;
        let lastFollowerAlias: string | undefined = undefined;
        let hasMore = true;

        while (hasMore) {
            const [followers, nextLastAlias] = await this.followDAO.getFollowers(
                status.user.alias,
                batchSize,
                lastFollowerAlias
            );

            // Add status to each follower's feed
            const feedPromises = followers.map(follower =>
                this.feedDAO.addToFeed(follower.alias, status)
            );
            await Promise.all(feedPromises);

            lastFollowerAlias = nextLastAlias || undefined;
            hasMore = nextLastAlias !== null;
        }
    }
}
