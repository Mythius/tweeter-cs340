# Large-Scale Database Seeding Guide

This guide explains how to populate your DynamoDB database with ~10,000 test users for pass-off testing.

## Overview

The seeding process creates:
- 10,000 test users (@testuser0 through @testuser9999)
- 1 special user (@matthias) with 10,000 followers
- All test users use the same profile picture (or you can modify to add custom images)

## Prerequisites

- AWS CLI configured with appropriate credentials
- Node.js and TypeScript installed
- DynamoDB tables already created with **PAY_PER_REQUEST** billing mode (tweeter-user, tweeter-follow)

## How to Run

Simply execute the seeding script:

```bash
cd tweeter-server
ts-node scripts/seed-large-database.ts
```

This script will:
- Create the @matthias user
- Generate 10,000 test users
- Create 10,000 follow relationships (@testuser0-9999 → @matthias)
- Update follower/followee counts

**Expected Duration:** 10-20 minutes depending on network speed and AWS region.

**Note:** Since your tables use PAY_PER_REQUEST (On-Demand) billing mode, DynamoDB automatically scales to handle the write load without throttling. No capacity planning needed!

## Test Credentials

After seeding, you can log in with:

**Main Test User:**
- Alias: `@matthias`
- Password: `password123`
- Followers: 10,000

**Test Users:**
- Aliases: `@testuser0`, `@testuser1`, ..., `@testuser9999`
- Password: `password123`
- Each follows @matthias

## Verification

To verify the seeding was successful:

1. Log in as @matthias and check the followers count (should be 10,000)
2. View the followers list to see @testuser0, @testuser1, etc.
3. Log in as any test user and verify they follow @matthias

## Troubleshooting

### Throttling Errors (Rare with On-Demand)

If you see throttling errors with PAY_PER_REQUEST billing:
- This is very rare but can happen if you exceed the default table limits
- Wait a few minutes and try again
- DynamoDB On-Demand can handle up to 40,000 write requests per second by default

### Out of Memory Errors

If Node.js runs out of memory:
```bash
NODE_OPTIONS="--max-old-space-size=4096" ts-node scripts/seed-large-database.ts
```

### Partial Completion

If the script fails partway through:
- The script is idempotent for users (duplicates will be skipped by DynamoDB)
- You may need to manually clean up partial data before re-running
- Check CloudWatch logs for specific error details

## Customization

### Change the Number of Users

Edit `seed-large-database.ts`:
```typescript
const TOTAL_USERS = 10000; // Change this value
const MATTHIAS_FOLLOWER_COUNT = 10000; // Change this value
```

### Change Profile Images

Edit `seed-large-database.ts`:
```typescript
const DEFAULT_PROFILE_IMAGE = "your-image-url-here";
```

Or modify the script to use different images per user.

## Cost Considerations

With **PAY_PER_REQUEST** (On-Demand) billing:
- You only pay for the read/write requests you actually use
- Write requests: $1.25 per million write request units
- For this seeding script:
  - ~10,000 user writes
  - ~10,000 follow writes
  - ~20,000 update operations
  - **Total estimated cost: ~$0.05 - $0.10**

No ongoing costs after seeding - you only pay when your application uses the tables!

## Notes

- All test users have the same password (`password123`) for easy testing
- The @matthias user is created separately from the test users
- Follow relationships use denormalized data (storing follower/followee info)
- The script uses batch writes for efficiency (25 items per batch)
- User counts are updated individually (not in batches) to ensure accuracy
