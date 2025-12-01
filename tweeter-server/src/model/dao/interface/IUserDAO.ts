import { User } from "tweeter-shared";

export interface IUserDAO {
  /**
   * Creates a new user in the database
   * @param user The user to create
   * @param passwordHash The hashed password
   */
  create(user: User, passwordHash: string): Promise<void>;

  /**
   * Gets a user by their alias
   * @param alias The user's alias
   * @returns The user or null if not found
   */
  getByAlias(alias: string): Promise<User | null>;

  /**
   * Gets a user with their password hash (for authentication)
   * @param alias The user's alias
   * @returns The user and password hash, or null if not found
   */
  getUserWithPassword(alias: string): Promise<{ user: User; passwordHash: string } | null>;

  /**
   * Updates a user's information
   * @param user The user to update
   */
  update(user: User): Promise<void>;

  /**
   * Atomically increments the follower count for a user
   * @param alias The user's alias
   * @param delta The amount to increment (can be negative)
   */
  incrementFollowerCount(alias: string, delta: number): Promise<void>;

  /**
   * Atomically increments the followee count for a user
   * @param alias The user's alias
   * @param delta The amount to increment (can be negative)
   */
  incrementFolloweeCount(alias: string, delta: number): Promise<void>;
}
