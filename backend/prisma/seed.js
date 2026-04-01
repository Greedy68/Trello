import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.card.deleteMany({});
  await prisma.list.deleteMany({});
  await prisma.board.deleteMany({});

  const board = await prisma.board.create({
    data: {
      title: "Bảng Trello của tôi",
      lists: {
        create: [
          {
            title: "Hướng dẫn cho người mới dùng Trello",
            position: 1,
            color: "#6c4fb2", 
            cards: {
              create: [
                {
                  title: "New to Trello? Start here",
                  position: 1,
                  coverImage:
                    "https://images.unsplash.com/photo-1611224885990-ab73b391cd2a?w=400",
                },
                {
                  title: "Nắm bắt từ email, Slack và Teams",
                  position: 2,
                  coverImage:
                    "https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=400",
                  description: "Hướng dẫn kết nối các công cụ",
                },
              ],
            },
          },
          {
            title: "Hôm nay",
            position: 2,
            color: "#8c6e1c", 
            cards: {
              create: [{ title: "Bắt đầu sử dụng Trello ✅", position: 1 }],
            },
          },
          {
            title: "Tuần này",
            position: 3,
            color: "#2a5a3a", 
            cards: {
              create: [],
            },
          },
          {
            title: "Sau này",
            position: 4,
            color: "#1e1f21", 
            cards: {
              create: [],
            },
          },
        ],
      },
    },
  });

  console.log("Seed data updated successfully!", { boardId: board.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
