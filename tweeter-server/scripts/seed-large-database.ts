/**
 * Large-Scale Database Seeding Script
 *
 * This script seeds the DynamoDB tables with test data for pass-off testing:
 * - Creates ~10,000 test users
 * - Creates @matthias user with 10,000 followers
 * - Uses batch writes for efficiency
 *
 * Note: This script works with PAY_PER_REQUEST (On-Demand) billing mode,
 * which automatically scales to handle the write load without throttling.
 *
 * Usage: ts-node scripts/seed-large-database.ts
 */

import { User } from "tweeter-shared";
import { DynamoDAOFactory } from "../src/model/dao/factory/DynamoDAOFactory";
import * as bcrypt from "bcryptjs";
import { DynamoDBDocumentClient, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";

const factory = DynamoDAOFactory.getInstance();
const userDAO = factory.createUserDAO();
const followDAO = factory.createFollowDAO();

// Configuration
const TOTAL_USERS = 10000;
const MATTHIAS_FOLLOWER_COUNT = 10000;
const BATCH_SIZE = 25; // DynamoDB batch write limit
const DEFAULT_PROFILE_IMAGE = "https://tweeter-matthias-profile-images.s3.us-west-1.amazonaws.com/users/default1.jpg";
const PASSWORD = "password123";

// Sample names for generating realistic users
const FIRST_NAMES = [
  "Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Henry", "Ivy", "Jack",
  "Kate", "Leo", "Maria", "Noah", "Olivia", "Paul", "Quinn", "Rachel", "Sam", "Tina",
  "Uma", "Victor", "Wendy", "Xavier", "Yara", "Zoe", "Adam", "Beth", "Carl", "Dora",
  "Eric", "Fiona", "George", "Hannah", "Isaac", "Julia", "Kevin", "Laura", "Mike", "Nina",
  "Oscar", "Penny", "Quentin", "Rose", "Steve", "Tara", "Umar", "Vera", "Will", "Xena",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Walker", "Hall", "Allen", "Young", "King", "Wright", "Scott", "Torres", "Nguyen",
  "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Mitchell", "Perez", "Roberts", "Turner",
  "Phillips", "Campbell", "Parker", "Evans", "Edwards", "Collins", "Stewart", "Sanchez", "Morris", "Rogers",
];

/**
 * Get DynamoDB DocumentClient from the DAO (internal access)
 */
function getDocClient(): DynamoDBDocumentClient {
  // Access the internal docClient from the factory
  return (factory as any).docClient;
}

/**
 * Batch write users to DynamoDB
 */
async function batchWriteUsers(users: { alias: string; firstName: string; lastName: string; imageUrl: string; passwordHash: string }[]): Promise<void> {
  const docClient = getDocClient();

  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);
    const writeRequests = batch.map(user => ({
      PutRequest: {
        Item: {
          alias: user.alias,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
          passwordHash: user.passwordHash,
          followerCount: 0,
          followeeCount: 0,
        },
      },
    }));

    const params = {
      RequestItems: {
        "tweeter-user": writeRequests,
      },
    };

    try {
      await docClient.send(new BatchWriteCommand(params));
    } catch (error) {
      console.error(`Failed to batch write users ${i}-${i + batch.length}:`, error);
      throw error;
    }
  }
}

/**
 * Batch write follow relationships to DynamoDB
 */
async function batchWriteFollows(follows: { follower: User; followee: User }[]): Promise<void> {
  const docClient = getDocClient();

  for (let i = 0; i < follows.length; i += BATCH_SIZE) {
    const batch = follows.slice(i, i + BATCH_SIZE);
    const writeRequests = batch.map(({ follower, followee }) => ({
      PutRequest: {
        Item: {
          follower_alias: follower.alias,
          followee_alias: followee.alias,
          follower_firstName: follower.firstName,
          follower_lastName: follower.lastName,
          follower_imageUrl: follower.imageUrl,
          followee_firstName: followee.firstName,
          followee_lastName: followee.lastName,
          followee_imageUrl: followee.imageUrl,
          timestamp: Date.now(),
        },
      },
    }));

    const params = {
      RequestItems: {
        "tweeter-follow": writeRequests,
      },
    };

    try {
      await docClient.send(new BatchWriteCommand(params));
    } catch (error) {
      console.error(`Failed to batch write follows ${i}-${i + batch.length}:`, error);
      throw error;
    }
  }
}

/**
 * Update user counts in batch
 */
async function updateUserCounts(updates: { alias: string; followerDelta: number; followeeDelta: number }[]): Promise<void> {
  // Process updates in smaller batches to avoid rate limiting
  for (const update of updates) {
    if (update.followerDelta !== 0) {
      await userDAO.incrementFollowerCount(update.alias, update.followerDelta);
    }
    if (update.followeeDelta !== 0) {
      await userDAO.incrementFolloweeCount(update.alias, update.followeeDelta);
    }
  }
}

async function seedLargeDatabase() {
  console.log("🌱 Starting large-scale database seeding...\n");
  console.log(`Target: ${TOTAL_USERS.toLocaleString()} users with @matthias having ${MATTHIAS_FOLLOWER_COUNT.toLocaleString()} followers\n`);
  console.log("Using PAY_PER_REQUEST billing - no capacity planning needed!\n");

  const startTime = Date.now();

  try {
    // Step 1: Create @matthias user first
    console.log("Creating @matthias user...");
    const passwordHash = await bcrypt.hash(PASSWORD, 10);
    const matthias = new User("Matthias", "User", "@matthias", DEFAULT_PROFILE_IMAGE);
    await userDAO.create(matthias, passwordHash);
    console.log("✅ Created @matthias\n");

    // Step 2: Generate test users
    console.log(`Generating ${TOTAL_USERS.toLocaleString()} test users...`);
    const users: User[] = [];
    const userRecords: { alias: string; firstName: string; lastName: string; imageUrl: string; passwordHash: string }[] = [];

    for (let i = 0; i < TOTAL_USERS; i++) {
      const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
      const lastName = LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length];
      const alias = `@testuser${i}`;

      const user = new User(firstName, lastName, alias, DEFAULT_PROFILE_IMAGE);
      users.push(user);
      userRecords.push({
        alias,
        firstName,
        lastName,
        imageUrl: DEFAULT_PROFILE_IMAGE,
        passwordHash,
      });

      if ((i + 1) % 1000 === 0) {
        console.log(`  Generated ${(i + 1).toLocaleString()} users...`);
      }
    }
    console.log(`✅ Generated ${TOTAL_USERS.toLocaleString()} user records\n`);

    // Step 3: Batch write users to DynamoDB
    console.log("Writing users to DynamoDB in batches...");
    await batchWriteUsers(userRecords);
    console.log(`✅ Wrote ${TOTAL_USERS.toLocaleString()} users to DynamoDB\n`);

    // Step 4: Create follow relationships (first 10,000 users follow @matthias)
    console.log(`Creating ${MATTHIAS_FOLLOWER_COUNT.toLocaleString()} followers for @matthias...`);
    const follows: { follower: User; followee: User }[] = [];

    for (let i = 0; i < MATTHIAS_FOLLOWER_COUNT; i++) {
      follows.push({
        follower: users[i],
        followee: matthias,
      });

      if ((i + 1) % 1000 === 0) {
        console.log(`  Prepared ${(i + 1).toLocaleString()} follow relationships...`);
      }
    }

    // Step 5: Batch write follow relationships
    console.log("Writing follow relationships to DynamoDB in batches...");
    await batchWriteFollows(follows);
    console.log(`✅ Wrote ${MATTHIAS_FOLLOWER_COUNT.toLocaleString()} follow relationships\n`);

    // Step 6: Update follower/followee counts
    console.log("Updating user counts...");

    // Update @matthias follower count
    await userDAO.incrementFollowerCount("@matthias", MATTHIAS_FOLLOWER_COUNT);
    console.log(`  ✓ Updated @matthias follower count: ${MATTHIAS_FOLLOWER_COUNT.toLocaleString()}`);

    // Update followee counts for all users who follow @matthias
    console.log("  Updating followee counts for test users (this may take a while)...");
    let updateCount = 0;
    for (let i = 0; i < MATTHIAS_FOLLOWER_COUNT; i++) {
      await userDAO.incrementFolloweeCount(users[i].alias, 1);
      updateCount++;

      if (updateCount % 1000 === 0) {
        console.log(`    Updated ${updateCount.toLocaleString()} followee counts...`);
      }
    }
    console.log(`✅ Updated ${updateCount.toLocaleString()} followee counts\n`);

    // Summary
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000 / 60).toFixed(2);

    console.log("=".repeat(70));
    console.log("🎉 Large-scale database seeding complete!");
    console.log("=".repeat(70));
    console.log(`Total users created: ${(TOTAL_USERS + 1).toLocaleString()} (including @matthias)`);
    console.log(`@matthias followers: ${MATTHIAS_FOLLOWER_COUNT.toLocaleString()}`);
    console.log(`Follow relationships: ${MATTHIAS_FOLLOWER_COUNT.toLocaleString()}`);
    console.log(`Time elapsed: ${duration} minutes`);
    console.log("\n📝 Test credentials:");
    console.log("   Alias: @matthias");
    console.log("   Password: password123");
    console.log("\n   Or use any test user:");
    console.log("   Alias: @testuser0, @testuser1, ... @testuser9999");
    console.log("   Password: password123");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run the seeding script
seedLargeDatabase()
  .then(() => {
    console.log("\n✨ Seeding completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seeding failed:", error);
    process.exit(1);
  });
