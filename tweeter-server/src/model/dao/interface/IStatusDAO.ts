import { Status } from "tweeter-shared";

export interface IStatusDAO {
  /**
   * Creates a new status (post)
   * @param status The status to create
   */
  create(status: Status): Promise<void>;

  /**
   * Gets a user's story (their posted statuses)
   * @param userAlias The user's alias
   * @param limit The maximum number of results to return
   * @param lastTimestamp The timestamp of the last status from the previous page (for pagination)
   * @returns A tuple of [statuses, lastTimestamp] where lastTimestamp is null if no more pages
   */
  getStory(userAlias: string, limit: number, lastTimestamp?: number): Promise<[Status[], number | null]>;

  /**
   * Deletes a status
   * @param userAlias The user's alias
   * @param timestamp The timestamp of the status to delete
   */
  delete(userAlias: string, timestamp: number): Promise<void>;
}
