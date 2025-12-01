import { Status } from "tweeter-shared";

export interface IFeedDAO {
  /**
   * Adds a status to a user's feed
   * @param receiverAlias The alias of the user whose feed to add to
   * @param status The status to add to the feed
   */
  addToFeed(receiverAlias: string, status: Status): Promise<void>;

  /**
   * Gets a user's feed (statuses from people they follow)
   * @param receiverAlias The user's alias
   * @param limit The maximum number of results to return
   * @param lastTimestamp The timestamp of the last status from the previous page (for pagination)
   * @returns A tuple of [statuses, lastTimestamp] where lastTimestamp is null if no more pages
   */
  getFeed(receiverAlias: string, limit: number, lastTimestamp?: number): Promise<[Status[], number | null]>;

  /**
   * Deletes a status from a user's feed
   * @param receiverAlias The user's alias
   * @param timestamp The timestamp of the status to delete
   */
  delete(receiverAlias: string, timestamp: number): Promise<void>;
}
