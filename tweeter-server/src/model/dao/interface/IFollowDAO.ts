import { User } from "tweeter-shared";

export interface IFollowDAO {
  /**
   * Creates a follow relationship
   * @param followerAlias The alias of the user following
   * @param followeeAlias The alias of the user being followed
   * @param followerUser The full follower user object (for denormalization)
   * @param followeeUser The full followee user object (for denormalization)
   */
  create(
    followerAlias: string,
    followeeAlias: string,
    followerUser: User,
    followeeUser: User
  ): Promise<void>;

  /**
   * Deletes a follow relationship
   * @param followerAlias The alias of the user following
   * @param followeeAlias The alias of the user being followed
   */
  delete(followerAlias: string, followeeAlias: string): Promise<void>;

  /**
   * Checks if a user is following another user
   * @param followerAlias The alias of the potential follower
   * @param followeeAlias The alias of the potential followee
   * @returns True if the follow relationship exists
   */
  isFollowing(followerAlias: string, followeeAlias: string): Promise<boolean>;

  /**
   * Gets the users that a user follows (followees)
   * @param followerAlias The alias of the follower
   * @param limit The maximum number of results to return
   * @param lastFolloweeAlias The alias of the last followee from the previous page (for pagination)
   * @returns A tuple of [users, lastKey] where lastKey is null if no more pages
   */
  getFollowees(
    followerAlias: string,
    limit: number,
    lastFolloweeAlias?: string
  ): Promise<[User[], string | null]>;

  /**
   * Gets the users that follow a user (followers)
   * @param followeeAlias The alias of the followee
   * @param limit The maximum number of results to return
   * @param lastFollowerAlias The alias of the last follower from the previous page (for pagination)
   * @returns A tuple of [users, lastKey] where lastKey is null if no more pages
   */
  getFollowers(
    followeeAlias: string,
    limit: number,
    lastFollowerAlias?: string
  ): Promise<[User[], string | null]>;

  /**
   * Gets the count of followers for a user
   * @param followeeAlias The alias of the followee
   * @returns The number of followers
   */
  getFollowerCount(followeeAlias: string): Promise<number>;

  /**
   * Gets the count of followees for a user
   * @param followerAlias The alias of the follower
   * @returns The number of followees
   */
  getFolloweeCount(followerAlias: string): Promise<number>;

  /**
   * Gets all follower aliases for a user (for fan-out)
   * @param followeeAlias The alias of the followee
   * @returns Array of follower aliases
   */
  getFollowerAliases(followeeAlias: string): Promise<string[]>;
}
