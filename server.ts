import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

interface questionInterface {
  question: string;
  answer: string;
}

let currentProblem: questionInterface = generateNewProblem();
let solved = false;

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  // main connection
  io.on("connection", (socket) => {
    // quiz part start from here

    if (!currentProblem) {
      currentProblem = generateNewProblem();
    }

    socket.emit("new-problem", currentProblem);

    socket.on("submit-answer", async ({ answer, userId }) => {
      console.log(answer, userId, "this is answer");
      if (!solved && answer === currentProblem.answer) {
        solved = true;
        await declareWinner(userId);

        io.emit("winner", { userId });

        setTimeout(() => {
          solved = false;
          currentProblem = generateNewProblem();
          io.emit("new-problem", currentProblem);
        }, 2000);
      }
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});

function generateNewProblem() {
  const num1 = Math.floor(Math.random() * 100);
  const num2 = Math.floor(Math.random() * 100);
  return {
    question: `${num1} + ${num2}`,
    answer: (num1 + num2).toString(),
  };
}

async function declareWinner(userId: string) {
  await prisma.user.update({
    where: { name: userId },
    data: { score: { increment: 1 } },
  });
}
