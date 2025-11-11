import type { PostStatusRequest } from "tweeter-shared";
import { TweeterResponse } from "tweeter-shared";
import { PostService } from "../../service/post/PostService";
import { BaseLambda } from "../BaseLambda";

class PostStatusLambda extends BaseLambda<PostStatusRequest, TweeterResponse> {
    protected async execute(request: PostStatusRequest): Promise<TweeterResponse> {
        if (!request.newStatus) {
            throw new Error("[bad-request] Status cannot be empty");
        }
        if (!request.newStatus.post || request.newStatus.post.trim() === "") {
            throw new Error("[bad-request] Status post content cannot be empty");
        }
        if (!request.newStatus.user) {
            throw new Error("[bad-request] Status must have a user");
        }

        const postService = new PostService();
        await postService.postStatus(request.token, request.newStatus);
        return {
            success: true,
            message: null
        };
    }
}

export const handler = async (request: PostStatusRequest): Promise<TweeterResponse> => {
    return new PostStatusLambda().handleRequest(request);
};
