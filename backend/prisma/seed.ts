import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // テストユーザー作成
  const user1 = await prisma.user.create({
    data: {
      email: "alice@example.com",
      username: "alice",
      displayName: "Alice Johnson",
      bio: "Hello! Nice to meet you 😊",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "bob@example.com",
      username: "bob",
      displayName: "Bob Smith",
      bio: "Software developer and coffee lover ☕",
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: "carol@example.com",
      username: "carol",
      displayName: "Carol Brown",
      bio: "Photographer | Travel enthusiast 📸",
    },
  });

  // テスト投稿作成
  const post1 = await prisma.post.create({
    data: {
      userId: user1.id,
      content: "Hello world! This is my first post on this platform! 🎉",
    },
  });

  const post2 = await prisma.post.create({
    data: {
      userId: user2.id,
      content:
        "Just finished working on a new React project. TypeScript is amazing! 🚀",
    },
  });

  const post3 = await prisma.post.create({
    data: {
      userId: user1.id,
      content: "Beautiful sunset today. Nature never fails to amaze me 🌅",
    },
  });

  // フォロー関係作成
  await prisma.follow.create({
    data: {
      followerId: user2.id,
      followingId: user1.id,
    },
  });

  await prisma.follow.create({
    data: {
      followerId: user3.id,
      followingId: user1.id,
    },
  });

  await prisma.follow.create({
    data: {
      followerId: user1.id,
      followingId: user2.id,
    },
  });

  // いいね作成
  await prisma.like.create({
    data: {
      userId: user2.id,
      postId: post1.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: user3.id,
      postId: post1.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: user1.id,
      postId: post2.id,
    },
  });

  // コメント作成
  const comment1 = await prisma.comment.create({
    data: {
      userId: user2.id,
      postId: post1.id,
      content: "Welcome to the platform! 🎊",
    },
  });

  const comment2 = await prisma.comment.create({
    data: {
      userId: user3.id,
      postId: post1.id,
      content: "Great first post!",
    },
  });

  // 返信コメント作成
  await prisma.comment.create({
    data: {
      userId: user1.id,
      postId: post1.id,
      parentCommentId: comment1.id,
      content: "Thank you so much! 😊",
    },
  });

  console.log("Seed data created successfully!");
  console.log(`Created ${await prisma.user.count()} users`);
  console.log(`Created ${await prisma.post.count()} posts`);
  console.log(`Created ${await prisma.follow.count()} follows`);
  console.log(`Created ${await prisma.like.count()} likes`);
  console.log(`Created ${await prisma.comment.count()} comments`);
}

main()
  .catch((e) => {
    console.error("Seed failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
