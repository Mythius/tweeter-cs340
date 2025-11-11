import type { PostStatusRequest } from "tweeter-shared";
import { TweeterResponse } from "tweeter-shared";
import { PostService } from "../../service/post/PostService";
import { BaseLambda } from "../BaseLambda";

class PostStatusLambda extends BaseLambda<PostStatusRequest, TweeterResponse> {
    protected async execute(request: PostStatusRequest): Promise<TweeterResponse> {
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
