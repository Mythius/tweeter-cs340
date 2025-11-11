import type { StatusDto } from "tweeter-shared";

export class PostService {
    public async postStatus(token: string, newStatus: StatusDto): Promise<void> {
        // TODO: Validate token, save to database, add to SQS for fan-out
        await new Promise((f) => setTimeout(f, 2000));
    }
}
