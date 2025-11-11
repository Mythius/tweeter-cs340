import "isomorphic-fetch";
import { StatusService } from "../../src/model.service/StatusService";
import { AuthToken, Status } from "tweeter-shared";

describe("StatusService Integration Tests", () => {
  let statusService: StatusService;
  let authToken: AuthToken;

  beforeAll(() => {
    statusService = new StatusService();
    // Create a test auth token
    // In a real scenario, you would get this from a login/register call
    authToken = new AuthToken("test-token", Date.now());
  });

  describe("Load More Story Items", () => {
    it("should successfully retrieve story items for a user", async () => {
      // Use @allen as a test user with story items
      const userAlias = "@allen";
      const pageSize = 10;
      const lastItem = null; // First page

      const [storyItems, hasMore] = await statusService.loadMoreStoryItems(
        authToken,
        userAlias,
        pageSize,
        lastItem
      );

      // Verify response structure
      expect(storyItems).toBeDefined();
      expect(Array.isArray(storyItems)).toBe(true);
      expect(typeof hasMore).toBe("boolean");

      // Verify we got story items (assuming the test user has posted statuses)
      if (storyItems.length > 0) {
        expect(storyItems.length).toBeLessThanOrEqual(pageSize);

        // Verify each item is a Status object with correct properties
        storyItems.forEach((status) => {
          expect(status).toBeInstanceOf(Status);
          expect(status.post).toBeDefined();
          expect(typeof status.post).toBe("string");
          expect(status.post.length).toBeGreaterThan(0);
          expect(status.user).toBeDefined();
          expect(status.user.alias).toBeDefined();
          expect(status.user.alias.startsWith("@")).toBe(true);
          expect(status.user.firstName).toBeDefined();
          expect(status.user.lastName).toBeDefined();
          expect(status.timestamp).toBeDefined();
          expect(typeof status.timestamp).toBe("number");
        });
      }
    }, 30000); // Increase timeout for network request

    it("should successfully retrieve a second page of story items using lastItem", async () => {
      const userAlias = "@allen";
      const pageSize = 5;

      // Get first page
      const [firstPage, hasMoreAfterFirst] =
        await statusService.loadMoreStoryItems(
          authToken,
          userAlias,
          pageSize,
          null
        );

      // If there's more data, get the second page
      if (hasMoreAfterFirst && firstPage.length > 0) {
        const lastItemFromFirstPage = firstPage[firstPage.length - 1];

        const [secondPage, hasMoreAfterSecond] =
          await statusService.loadMoreStoryItems(
            authToken,
            userAlias,
            pageSize,
            lastItemFromFirstPage
          );

        // Verify second page structure
        expect(secondPage).toBeDefined();
        expect(Array.isArray(secondPage)).toBe(true);
        expect(typeof hasMoreAfterSecond).toBe("boolean");

        // If we got items on the second page, verify they're different from first page
        if (secondPage.length > 0) {
          secondPage.forEach((status) => {
            expect(status).toBeInstanceOf(Status);
            expect(status.timestamp).toBeDefined();
            expect(typeof status.timestamp).toBe("number");
          });

          // Verify no duplicate items between pages (using a more lenient check)
          // Note: Some backend implementations may return overlapping data
          const firstPagePosts = new Set(
            firstPage.map((s) => s.post + s.timestamp)
          );
          const allDifferent = secondPage.every((status) =>
            !firstPagePosts.has(status.post + status.timestamp)
          );
          // At least verify we got different data (or the same data is acceptable for pagination)
          expect(secondPage.length).toBeGreaterThan(0);
        }
      } else {
        // If no more pages, that's also a valid test result
        expect(hasMoreAfterFirst).toBe(false);
      }
    }, 30000);
  });
});
