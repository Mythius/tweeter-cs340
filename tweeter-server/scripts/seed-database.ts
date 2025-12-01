/**
 * Database Seeding Script
 *
 * This script seeds the DynamoDB tables with test data:
 * - Creates 25 test users with realistic profile images
 * - Creates follow relationships (ensuring some users have 10+ followers/followees)
 * - Creates 20+ statuses per user for story testing
 *
 * Usage: ts-node scripts/seed-database.ts
 */

import { User, Status } from "tweeter-shared";
import { DynamoDAOFactory } from "../src/model/dao/factory/DynamoDAOFactory";
import * as bcrypt from "bcryptjs";

const factory = DynamoDAOFactory.getInstance();
const userDAO = factory.createUserDAO();
const followDAO = factory.createFollowDAO();
const statusDAO = factory.createStatusDAO();
const feedDAO = factory.createFeedDAO();

// Sample profile images (using placeholder service)
const PROFILE_IMAGES = [
  "https://tweeter-matthias-profile-images.s3.us-west-1.amazonaws.com/users/default1.jpg",
  "https://tweeter-matthias-profile-images.s3.us-west-1.amazonaws.com/users/default2.jpg",
  "https://tweeter-matthias-profile-images.s3.us-west-1.amazonaws.com/users/default3.jpg",
  "https://tweeter-matthias-profile-images.s3.us-west-1.amazonaws.com/users/default4.jpg",
  "https://tweeter-matthias-profile-images.s3.us-west-1.amazonaws.com/users/default5.jpg",
];

// Sample first and last names
const FIRST_NAMES = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Henry", "Ivy", "Jack", "Kate", "Leo", "Maria", "Noah", "Olivia", "Paul", "Quinn", "Rachel", "Sam", "Tina", "Uma", "Victor", "Wendy", "Xavier", "Yara"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Walker", "Hall", "Allen", "Young"];

// Sample status posts
const STATUS_TEMPLATES = [
  "Just finished a great workout! 💪",
  "Beautiful sunset today 🌅",
  "Coffee and coding on a Sunday morning ☕️",
  "Excited about the new project launch!",
  "Throwback to summer vacation 🏖️",
  "Learning something new every day 📚",
  "Best meal I've had in months! 🍝",
  "Can't believe it's already Monday again",
  "Grateful for amazing friends and family ❤️",
  "New blog post coming soon!",
  "Just hit a new personal record! 🎉",
  "Rainy day thoughts ☔️",
  "Weekend vibes are the best",
  "Tech conference was mind-blowing! 🚀",
  "Homemade pizza night 🍕",
  "Morning run complete ✅",
  "Binge-watching my favorite show again",
  "Travel plans are coming together! ✈️",
  "Sometimes you just need a good book",
  "Code review day - let's crush it!",
];

async function seedDatabase() {
  console.log("🌱 Starting database seeding...\n");

  try {
    // Step 1: Create 25 users
    console.log("Creating 25 test users...");
    const users: User[] = [];
    const password = "password123"; // Simple password for testing
    const passwordHash = await bcrypt.hash(password, 10);

    for (let i = 0; i < 25; i++) {
      const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
      const lastName = LAST_NAMES[i % LAST_NAMES.length];
      const alias = `@${firstName.toLowerCase()}${lastName.toLowerCase()}${i > 0 ? i : ""}`;
      const imageUrl = PROFILE_IMAGES[i % PROFILE_IMAGES.length];

      const user = new User(firstName, lastName, alias, imageUrl);
      await userDAO.create(user, passwordHash);
      users.push(user);

      if ((i + 1) % 5 === 0) {
        console.log(`  ✓ Created ${i + 1} users`);
      }
    }
    console.log(`✅ Created ${users.length} users\n`);

    // Step 2: Create follow relationships
    console.log("Creating follow relationships...");
    let followCount = 0;

    // Make the first 5 users "popular" (15+ followers each)
    for (let i = 0; i < 5; i++) {
      const popularUser = users[i];

      // Have 15-20 random users follow this popular user
      const numFollowers = 15 + Math.floor(Math.random() * 6);
      const followerIndices = new Set<number>();

      while (followerIndices.size < numFollowers) {
        const randomIndex = Math.floor(Math.random() * users.length);
        if (randomIndex !== i) {
          followerIndices.add(randomIndex);
        }
      }

      for (const followerIndex of followerIndices) {
        const follower = users[followerIndex];
        await followDAO.create(follower.alias, popularUser.alias, follower, popularUser);
        await userDAO.incrementFolloweeCount(follower.alias, 1);
        await userDAO.incrementFollowerCount(popularUser.alias, 1);
        followCount++;
      }
    }

    // Create additional random follow relationships
    for (let i = 0; i < 100; i++) {
      const followerIndex = Math.floor(Math.random() * users.length);
      const followeeIndex = Math.floor(Math.random() * users.length);

      if (followerIndex !== followeeIndex) {
        try {
          const follower = users[followerIndex];
          const followee = users[followeeIndex];

          // Check if already following
          const isFollowing = await followDAO.isFollowing(follower.alias, followee.alias);
          if (!isFollowing) {
            await followDAO.create(follower.alias, followee.alias, follower, followee);
            await userDAO.incrementFolloweeCount(follower.alias, 1);
            await userDAO.incrementFollowerCount(followee.alias, 1);
            followCount++;
          }
        } catch (error) {
          // Skip if already exists
        }
      }
    }
    console.log(`✅ Created ${followCount} follow relationships\n`);

    // Step 3: Create statuses (20-30 per user)
    console.log("Creating statuses for users...");
    let statusCount = 0;
    const allStatuses: { user: User; status: Status }[] = [];

    for (const user of users) {
      const numStatuses = 20 + Math.floor(Math.random() * 11); // 20-30 statuses

      for (let i = 0; i < numStatuses; i++) {
        // Create statuses with timestamps spread over the last 30 days
        const daysAgo = Math.floor(Math.random() * 30);
        const timestamp = Date.now() - (daysAgo * 24 * 60 * 60 * 1000) - (i * 60 * 60 * 1000);

        const postText = STATUS_TEMPLATES[Math.floor(Math.random() * STATUS_TEMPLATES.length)];
        const status = new Status(postText, user, timestamp);

        await statusDAO.create(status);
        allStatuses.push({ user, status });
        statusCount++;
      }

      console.log(`  ✓ Created statuses for ${user.alias}`);
    }
    console.log(`✅ Created ${statusCount} statuses\n`);

    // Step 4: Populate feeds (add each user's statuses to their followers' feeds)
    console.log("Populating user feeds...");
    let feedItemCount = 0;

    for (const { user, status } of allStatuses) {
      // Get all followers of this user
      let lastFollowerAlias: string | undefined = undefined;
      let hasMore = true;

      while (hasMore) {
        const [followers, nextLastAlias] = await followDAO.getFollowers(
          user.alias,
          25,
          lastFollowerAlias
        );

        // Add status to each follower's feed
        for (const follower of followers) {
          await feedDAO.addToFeed(follower.alias, status);
          feedItemCount++;
        }

        lastFollowerAlias = nextLastAlias || undefined;
        hasMore = nextLastAlias !== null;
      }
    }
    console.log(`✅ Populated feeds with ${feedItemCount} items\n`);

    // Summary
    console.log("=".repeat(50));
    console.log("🎉 Database seeding complete!");
    console.log("=".repeat(50));
    console.log(`Users created: ${users.length}`);
    console.log(`Follow relationships: ${followCount}`);
    console.log(`Statuses created: ${statusCount}`);
    console.log(`Feed items created: ${feedItemCount}`);
    console.log("\n📝 Test credentials:");
    console.log("   Alias: @alicesmith (or any user alias)");
    console.log("   Password: password123");
    console.log("\n💡 Tip: Check the first 5 users - they have 15+ followers!");
    console.log("💡 Your feed will show posts from users you follow!");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run the seeding script
seedDatabase()
  .then(() => {
    console.log("\n✨ Seeding completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seeding failed:", error);
    process.exit(1);
  });
