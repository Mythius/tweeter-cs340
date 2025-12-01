export interface ISessionDAO {
  /**
   * Creates a new session
   * @param token The authentication token
   * @param userAlias The user's alias
   * @param timestamp The session creation timestamp
   */
  create(token: string, userAlias: string, timestamp: number): Promise<void>;

  /**
   * Gets a session by token
   * @param token The authentication token
   * @returns The session data or null if not found/expired
   */
  get(token: string): Promise<{ userAlias: string; timestamp: number } | null>;

  /**
   * Deletes a session
   * @param token The authentication token
   */
  delete(token: string): Promise<void>;
}
