import { Status } from "tweeter-shared";
import type { StatusDto } from "tweeter-shared";
import { IDAOFactory } from "../../dao/interface/IDAOFactory";
import { DynamoDAOFactory } from "../../dao/factory/DynamoDAOFactory";
import { IStatusDAO } from "../../dao/interface/IStatusDAO";
import { IFeedDAO } from "../../dao/interface/IFeedDAO";
import { AuthorizationService } from "../auth/AuthorizationService";

export class StatusService {
    private statusDAO: IStatusDAO;
    private feedDAO: IFeedDAO;
    private authService: AuthorizationService;

    constructor(daoFactory?: IDAOFactory) {
        const factory = daoFactory || DynamoDAOFactory.getInstance();
        this.statusDAO = factory.createStatusDAO();
        this.feedDAO = factory.createFeedDAO();
        this.authService = new AuthorizationService(factory);
    }

    public async loadMoreFeedItems(
        token: string,
        userAlias: string,
        pageSize: number,
        lastItem: StatusDto | null
    ): Promise<[StatusDto[], boolean]> {
        // Validate token
        await this.authService.validateToken(token);

        // Get feed from database
        const lastTimestamp = lastItem ? lastItem.timestamp : undefined;
        const [statuses, lastKey] = await this.feedDAO.getFeed(userAlias, pageSize, lastTimestamp);

        return [statuses.map(status => status.dto), lastKey !== null];
    }

    public async loadMoreStoryItems(
        token: string,
        userAlias: string,
        pageSize: number,
        lastItem: StatusDto | null
    ): Promise<[StatusDto[], boolean]> {
        // Validate token
        await this.authService.validateToken(token);

        // Get story from database
        const lastTimestamp = lastItem ? lastItem.timestamp : undefined;
        const [statuses, lastKey] = await this.statusDAO.getStory(userAlias, pageSize, lastTimestamp);

        return [statuses.map(status => status.dto), lastKey !== null];
    }
}
