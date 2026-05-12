import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as nodePath from 'path';

// Load .env before anything else touches process.env
dotenv.config({ path: nodePath.join(__dirname, '../../../.env') });

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';

import { User } from '../../modules/users/entities/user.entity';
import { UserProfile } from '../../modules/users/entities/user-profile.entity';
import { UserPhoto } from '../../modules/users/entities/user-photo.entity';
import { UserInterest } from '../../modules/users/entities/user-interest.entity';
import { Interest } from '../../modules/users/entities/interest.entity';
import { Block } from '../../modules/users/entities/block.entity';
import { Post } from '../../modules/posts/entities/post.entity';
import { PostMedia } from '../../modules/posts/entities/post-media.entity';
import { PostLike } from '../../modules/posts/entities/post-like.entity';
import { PostComment } from '../../modules/posts/entities/post-comment.entity';
import { Message } from '../../modules/chat/entities/message.entity';
import { Conversation } from '../../modules/chat/entities/conversation.entity';
import { MessageRead } from '../../modules/chat/entities/message-read.entity';

// ─── Data Source ─────────────────────────────────────────────────────────────
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'connectx_user',
  password: process.env.DB_PASSWORD || 'connectx_password',
  database: process.env.DB_NAME || 'dating_platform',
  synchronize: false,
  logging: false,
  entities: [
    User,
    UserProfile,
    UserPhoto,
    UserInterest,
    Interest,
    Block,
    Post,
    PostMedia,
    PostLike,
    PostComment,
    Message,
    Conversation,
    MessageRead,
  ],
});

// ─── Types ────────────────────────────────────────────────────────────────────
interface SeedPost {
  caption: string;
  hashtags: string[];
  isNsfw: boolean;
  visibility: 'public' | 'private' | 'friends';
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

interface SeedProfile {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bio: string;
  pronouns: string[];
  location: string;
  latitude: number;
  longitude: number;
  relationshipStatus: string;
  lookingFor: string[];
  occupation: string;
  education: string;
  profileVisibility: 'public' | 'private' | 'verified_only';
  preferences: {
    minAge: number;
    maxAge: number;
    maxDistance: number;
    genderPreference: string[];
  };
}

interface SeedUser {
  email: string;
  username: string;
  password: string;
  profile: SeedProfile;
  posts: SeedPost[];
}

// ─── Config ───────────────────────────────────────────────────────────────────
const BATCH_SIZE = 50;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Hash all unique passwords up front so we only bcrypt each distinct value once */
async function buildPasswordMap(users: SeedUser[]): Promise<Map<string, string>> {
  const unique = [...new Set(users.map((u) => u.password))];
  console.log(`  Hashing ${unique.length} unique password(s)...`);
  const hashed = await Promise.all(unique.map((p) => bcrypt.hash(p, 10)));
  const map = new Map<string, string>();
  unique.forEach((p, i) => map.set(p, hashed[i]));
  return map;
}

function progress(current: number, total: number, label: string) {
  const pct = Math.round((current / total) * 100);
  const bar = '#'.repeat(Math.floor(pct / 5)).padEnd(20, '-');
  process.stdout.write(`\r  [${bar}] ${pct}% — ${label}   `);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  const seedFile = nodePath.join(__dirname, 'users-data.json');

  if (!fs.existsSync(seedFile)) {
    console.error(`ERROR: users-data.json not found at ${seedFile}`);
    process.exit(1);
  }

  const seedUsers: SeedUser[] = JSON.parse(fs.readFileSync(seedFile, 'utf-8'));
  console.log(`\nLoaded ${seedUsers.length} users from users-data.json`);

  // ── Connect ────────────────────────────────────────────────────────────────
  await AppDataSource.initialize();
  console.log('Database connected.\n');

  const userRepo = AppDataSource.getRepository(User);
  const profileRepo = AppDataSource.getRepository(UserProfile);
  const postRepo = AppDataSource.getRepository(Post);

  // ── Skip already-seeded users (safe to re-run) ────────────────────────────
  const existingRows = await userRepo.find({ select: ['email'] });
  const existingEmails = new Set(existingRows.map((u) => u.email));
  const toInsert = seedUsers.filter((u) => !existingEmails.has(u.email));

  console.log(`Already in DB : ${existingEmails.size}`);
  console.log(`To insert     : ${toInsert.length}`);

  if (toInsert.length === 0) {
    console.log('\nNothing to insert — database is already fully seeded.');
    await AppDataSource.destroy();
    return;
  }

  // ── Pre-hash passwords ────────────────────────────────────────────────────
  const passwordMap = await buildPasswordMap(toInsert);

  // ── Insert in batches ─────────────────────────────────────────────────────
  let insertedUsers = 0;
  let insertedPosts = 0;

  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const batch = toInsert.slice(i, i + BATCH_SIZE);

    for (const seedUser of batch) {
      // 1. User row
      const user = userRepo.create({
        email: seedUser.email,
        username: seedUser.username,
        passwordHash: passwordMap.get(seedUser.password) as string,
        isVerified: true,
        isEmailVerified: true,
        status: 'active',
        privacySettings: {
          showOnline: true,
          allowMessages: true,
          allowSearch: true,
        },
      });
      const savedUser = await userRepo.save(user);

      // 2. Profile row
      const profile = profileRepo.create({
        userId: savedUser.id,
        firstName: seedUser.profile.firstName,
        lastName: seedUser.profile.lastName,
        dateOfBirth: new Date(seedUser.profile.dateOfBirth),
        gender: seedUser.profile.gender,
        bio: seedUser.profile.bio,
        pronouns: seedUser.profile.pronouns,
        location: seedUser.profile.location,
        latitude: seedUser.profile.latitude,
        longitude: seedUser.profile.longitude,
        relationshipStatus: seedUser.profile.relationshipStatus,
        lookingFor: seedUser.profile.lookingFor,
        occupation: seedUser.profile.occupation,
        education: seedUser.profile.education,
        profileVisibility: seedUser.profile.profileVisibility,
        preferences: seedUser.profile.preferences,
      });
      await profileRepo.save(profile);

      // 3. Posts
      if (seedUser.posts && seedUser.posts.length > 0) {
        const posts = seedUser.posts.map((p) =>
          postRepo.create({
            authorId: savedUser.id,
            caption: p.caption,
            hashtags: p.hashtags,
            isNsfw: p.isNsfw,
            visibility: p.visibility,
            likeCount: p.likeCount,
            commentCount: p.commentCount,
            createdAt: new Date(p.createdAt),
          })
        );
        await postRepo.save(posts);
        insertedPosts += posts.length;
      }

      insertedUsers++;
    }

    progress(i + batch.length, toInsert.length, `${insertedUsers} users / ${insertedPosts} posts`);
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n');
  console.log('='.repeat(55));
  console.log('  SEED COMPLETE');
  console.log('='.repeat(55));
  console.log(`  Users inserted  : ${insertedUsers}`);
  console.log(`  Posts inserted  : ${insertedPosts}`);
  console.log(`  Avg posts/user  : ${(insertedPosts / insertedUsers).toFixed(1)}`);
  console.log(`  Password        : Password123!  (all seed accounts)`);
  console.log('='.repeat(55));

  // ── Write credentials reference file ─────────────────────────────────────
  const credFile = nodePath.join(__dirname, 'seed-credentials.txt');
  const header = [
    'ConnectX — Seed Account Credentials',
    '='.repeat(55),
    'Password for ALL accounts: Password123!',
    '',
    `Total accounts seeded: ${insertedUsers}`,
    `Seeded at: ${new Date().toISOString()}`,
    '',
    'Format: #  |  email  |  username  |  location',
    '-'.repeat(55),
  ];

  const rows = toInsert.map(
    (u, idx) =>
      `${String(idx + 1).padStart(4)}.  ${u.email.padEnd(42)}  ${u.username.padEnd(28)}  ${u.profile.location}`
  );

  fs.writeFileSync(credFile, [...header, ...rows].join('\n'), 'utf-8');
  console.log(`\n  Credentials list saved to: seed-credentials.txt`);

  await AppDataSource.destroy();
  console.log('  Connection closed. Done.\n');
}

seed().catch((err) => {
  console.error('\nSeed failed:', err.message || err);
  process.exit(1);
});
