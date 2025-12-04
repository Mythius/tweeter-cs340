import "isomorphic-fetch";
import { PostStatusPresenter, PostStatusView } from "../../src/presenter/PostStatusPresenter";
import { ServerFacade } from "../../src/model.service/ServerFacade";
import { StatusService } from "../../src/model.service/StatusService";
import { AuthToken, User, LoginRequest } from "tweeter-shared";
import { mock, instance, verify, anything, when } from "@typestrong/ts-mockito";

/**
 * Integration Test for Post Status Feature
 *
 * This test verifies the complete post status flow:
 * 1. Login a user
 * 2. Post a status via PostStatusPresenter
 * 3. Verify "Status posted!" message is displayed
 * 4. Retrieve user's story from server
 * 5. Verify the new status appears in the story with correct details
 *
 * PREREQUISITES:
 * - Run the database seeding script first: ts-node tweeter-server/scripts/seed-large-database.ts
 * - This creates @testuser0 through @testuser9999 with password "password123"
 */

describe("Post Status Integration Test", () => {
  let serverFacade: ServerFacade;
  let statusService: StatusService;
  let authToken: AuthToken;
  let user: User;

  // Test data
  const testAlias = "@testuser0";
  const testPassword = "password123";
  const testPost = "Integration test post - " + Date.now();

  beforeAll(async () => {
    // Initialize services
    serverFacade = new ServerFacade();
    statusService = new StatusService();

    // Login the user
    const loginRequest: LoginRequest = {
      alias: testAlias,
      password: testPassword
    };

    try {
      [user, authToken] = await serverFacade.login(loginRequest);
      console.log(`Logged in as ${user.alias}`);
    } catch (error) {
      console.error("Failed to login:", error);
      throw error;
    }
  });

  it("should post a status and verify it appears in user's story", async () => {
    // STEP 1: Create mock view for PostStatusPresenter
    const mockView = mock<PostStatusView>();
    const mockViewInstance = instance(mockView);

    // Setup view mock behavior
    when(mockView.displayInfoMessage(anything(), anything())).thenReturn("toast-id");
    when(mockView.setIsLoading(anything())).thenReturn();
    when(mockView.setPost(anything())).thenReturn();
    when(mockView.deleteMessage(anything())).thenReturn();

    // STEP 2: Create presenter
    const presenter = new PostStatusPresenter(mockViewInstance);

    // STEP 3: Submit post
    console.log(`Posting status: "${testPost}"`);
    await presenter.submitPost(authToken, testPost, user);

    // STEP 4: Verify "Status posted!" message was displayed
    verify(mockView.displayInfoMessage("Status posted!", 2000)).once();
    console.log("✓ Verified 'Status posted!' message was displayed");

    // STEP 5: Retrieve user's story from server
    console.log("Fetching user's story from server...");
    const [storyItems, hasMore] = await statusService.loadMoreStoryItems(
      authToken,
      user.alias,
      10,  // pageSize
      null // lastItem (get from beginning)
    );

    // STEP 6: Verify the new status is in the story
    expect(storyItems.length).toBeGreaterThan(0);
    console.log(`✓ Story has ${storyItems.length} items`);

    // The most recent status should be our new post (story is sorted by timestamp desc)
    const mostRecentStatus = storyItems[0];

    // Verify all status details are correct
    expect(mostRecentStatus.post).toBe(testPost);
    expect(mostRecentStatus.user.alias).toBe(user.alias);
    expect(mostRecentStatus.user.firstName).toBe(user.firstName);
    expect(mostRecentStatus.user.lastName).toBe(user.lastName);
    expect(mostRecentStatus.timestamp).toBeDefined();
    expect(mostRecentStatus.timestamp).toBeLessThanOrEqual(Date.now());

    console.log("✓ Verified status details are correct");
    console.log(`  - Post: "${mostRecentStatus.post}"`);
    console.log(`  - User: ${mostRecentStatus.user.alias} (${mostRecentStatus.user.firstName} ${mostRecentStatus.user.lastName})`);
    console.log(`  - Timestamp: ${new Date(mostRecentStatus.timestamp).toISOString()}`);

  }, 10000); // 10 second timeout for integration test
});
