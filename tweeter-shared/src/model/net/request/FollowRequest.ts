import { UserDto } from "../../dto/UserDto";
import { TweeterRequest } from "./TweeterRequest";

export interface FollowRequest extends TweeterRequest {
    readonly user: UserDto;
}
