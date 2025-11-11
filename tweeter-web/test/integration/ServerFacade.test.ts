import "isomorphic-fetch";
import { ServerFacade } from "../../src/model.service/ServerFacade";
import { AuthToken, User } from "tweeter-shared";
import { Buffer } from "buffer";

describe("ServerFacade Integration Tests", () => {
  let serverFacade: ServerFacade;
  let authToken: AuthToken;
  let testUser: User;

  beforeAll(() => {
    serverFacade = new ServerFacade();
  });

  describe("Register", () => {
    it("should successfully register a new user and return user and auth token", async () => {
      // Generate a unique alias for each test run to avoid conflicts
      const uniqueAlias = `@testuser${Date.now()}`;

      // Create a simple 1x1 pixel PNG image in base64
      const imageBytes = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64"
      );
      const imageStringBase64 = imageBytes.toString("base64");

      const registerRequest = {
        firstName: "Integration",
        lastName: "Test",
        alias: uniqueAlias,
        password: "password123",
        userImageBytes: imageStringBase64,
        imageFileExtension: "png",
      };

      const [user, token] = await serverFacade.register(registerRequest);

      // Verify user object - the server successfully returned a user
      expect(user).toBeDefined();
      expect(user).toBeInstanceOf(User);
      expect(user.firstName).toBeDefined();
      expect(user.firstName.length).toBeGreaterThan(0);
      expect(user.lastName).toBeDefined();
      expect(user.lastName.length).toBeGreaterThan(0);
      expect(user.alias).toBeDefined();
      expect(user.alias.startsWith("@")).toBe(true);
      expect(user.imageUrl).toBeDefined();
      expect(user.imageUrl.length).toBeGreaterThan(0);

      // Verify auth token
      expect(token).toBeDefined();
      expect(token).toBeInstanceOf(AuthToken);
      expect(token.token).toBeDefined();
      expect(token.token.length).toBeGreaterThan(0);
      expect(token.timestamp).toBeDefined();
      expect(token.timestamp).toBeGreaterThan(0);

      // Save for use in other tests
      authToken = token;
      testUser = user;
    }, 30000); // Increase timeout for network request
  });

  describe("GetFollowers", () => {
    it("should successfully retrieve followers for a user", async () => {
      // Use a known user with followers (e.g., @allen - the first user from FakeData)
      // In a real scenario, you might need to set up test data or use a test account
      const request = {
        token: authToken ? authToken.token : "dummy-token",
        userAlias: "@allen", // Using a known test user
        pageSize: 10,
        lastItem: null,
      };

      const [followers, hasMore] = await serverFacade.getMoreFollowers(request);

      // Verify response structure
      expect(followers).toBeDefined();
      expect(Array.isArray(followers)).toBe(true);
      expect(typeof hasMore).toBe("boolean");

      // If there are followers, verify they are User objects
      if (followers.length > 0) {
        followers.forEach((follower) => {
          expect(follower).toBeInstanceOf(User);
          expect(follower.alias).toBeDefined();
          expect(follower.firstName).toBeDefined();
          expect(follower.lastName).toBeDefined();
        });
      }
    }, 30000);
  });

  describe("GetFollowersCount", () => {
    it("should successfully retrieve the follower count for a user", async () => {
      // Use @allen as a test user
      const testUserDto = {
        firstName: "Allen",
        lastName: "Anderson",
        alias: "@allen",
        imageUrl: "https://faculty.cs.byu.edu/~jwilkerson/cs340/tweeter/images/donald_duck.png",
      };

      const request = {
        token: authToken ? authToken.token : "dummy-token",
        user: testUserDto,
      };

      const followerCount = await serverFacade.getFollowerCount(request);

      // Verify response
      expect(followerCount).toBeDefined();
      expect(typeof followerCount).toBe("number");
      expect(followerCount).toBeGreaterThanOrEqual(0);
    }, 30000);

    it("should successfully retrieve the followee count for a user", async () => {
      // Use @allen as a test user
      const testUserDto = {
        firstName: "Allen",
        lastName: "Anderson",
        alias: "@allen",
        imageUrl: "https://faculty.cs.byu.edu/~jwilkerson/cs340/tweeter/images/donald_duck.png",
      };

      const request = {
        token: authToken ? authToken.token : "dummy-token",
        user: testUserDto,
      };

      const followeeCount = await serverFacade.getFolloweeCount(request);

      // Verify response
      expect(followeeCount).toBeDefined();
      expect(typeof followeeCount).toBe("number");
      expect(followeeCount).toBeGreaterThanOrEqual(0);
    }, 30000);
  });
});
