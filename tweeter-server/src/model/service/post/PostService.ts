import { Status } from "tweeter-shared";
import type { StatusDto } from "tweeter-shared";
import { IDAOFactory } from "../../dao/interface/IDAOFactory";
import { DynamoDAOFactory } from "../../dao/factory/DynamoDAOFactory";
import { IStatusDAO } from "../../dao/interface/IStatusDAO";
import { AuthorizationService } from "../auth/AuthorizationService";
import { SQSService } from "../queue/SQSService";

export class PostService {
    private statusDAO: IStatusDAO;
    private authService: AuthorizationService;
    private sqsService: SQSService;

    constructor(daoFactory?: IDAOFactory) {
        const factory = daoFactory || DynamoDAOFactory.getInstance();
        this.statusDAO = factory.createStatusDAO();
        this.authService = new AuthorizationService(factory);
        this.sqsService = new SQSService();
    }

    public async postStatus(token: string, newStatus: StatusDto): Promise<void> {
        // Validate token
        const userAlias = await this.authService.validateToken(token);

        // Convert DTO to domain object
        const status = Status.fromDto(newStatus);
        if (!status) {
            throw new Error("[bad-request] Invalid status data");
        }

        // Save to Status table (user's story)
        await this.statusDAO.create(status);

        // Queue for asynchronous fan-out to followers' feeds
        // This returns immediately, allowing user to see success in < 1 second
        // Feeds will be updated asynchronously within 120 seconds
        await this.sqsService.sendToPostStatusQueue(newStatus, userAlias);
    }
}
