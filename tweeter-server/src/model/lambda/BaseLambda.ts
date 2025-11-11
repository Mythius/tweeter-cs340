import { TweeterRequest, TweeterResponse } from "tweeter-shared";

export abstract class BaseLambda<TRequest extends TweeterRequest, TResponse extends TweeterResponse> {

    public async handleRequest(request: TRequest): Promise<TResponse> {
        try {
            return await this.execute(request);
        } catch (error) {
            return this.handleError(error);
        }
    }

    protected abstract execute(request: TRequest): Promise<TResponse>;

    protected handleError(error: unknown): TResponse {
        console.error("[Lambda Error]", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "An unknown error occurred"
        } as TResponse;
    }
}
