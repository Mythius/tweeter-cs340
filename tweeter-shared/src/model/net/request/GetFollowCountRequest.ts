import { UserDto } from "../../dto/UserDto";
import { TweeterRequest } from "./TweeterRequest";

export interface GetFollowCountRequest extends TweeterRequest {
    readonly user: UserDto;
}
