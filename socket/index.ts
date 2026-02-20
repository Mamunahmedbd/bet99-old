import dotenv from "dotenv";
dotenv.config();
import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import { createClient } from "redis";
import cors from "cors";
import "./utils/redis";
import "./SuperNode";
import { redisReplica } from "./utils/redis";
import axios from "axios";

const app = express();
const options: cors.CorsOptions = {
  origin: "*",
};
app.use(cors(options));
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: ["*"],
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

const redisClient = createClient();
redisClient.connect();

redisClient.on("connect", () => {
  console.log("connected to Redis");
});

redisClient.on("error", (err) => {
  console.error(err);
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

io.on("connection", (socket: Socket) => {
  console.log("a user connected");

  socket.on("joinRoomMatchIdWUserId", (room) => {
    socket.join(room);
  });

  socket.on("userRoomJoin", ({ userId }) => {
    userId = `user-${userId}`;
    socket.join(userId);
  });

  socket.on("login", (user: any) => {
    // Check if user is already online
    const userId = `user-${user._id}`;
    socket.join(userId);
    redisClient
      .get(userId)
      .then((data: any) => {
        const result = data
          ? JSON.parse(data)
          : {
              socketId: null,
              loggedIn: false,
              user: { sessionId: null },
              _id: null,
            };
        // User is already online, emit "logout" event to other sockets
        if (
          user.role !== "admin" &&
          user.sessionId !== result?.user?.sessionId
        ) {
          io.to(result.socketId).emit("logout", {
            userId,
            sessionId: user.sessionId,
          });
        }
        // Set user online status to true in Redis with an expiration time of 60 seconds
        redisClient
          .set(
            userId,
            JSON.stringify({ socketId: socket.id, loggedIn: true, user }),
            {
              EX: 24 * 60 * 60 * 2,
            }
          ) // 2 days expiry
          .then(() => {
            console.log(`${userId} is now online`);
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });

  socket.on("logout", (userId: string) => {
    userId = `user-${userId}`;
    // Set user online status to false in Redis
    redisClient
      .del(userId)
      .then(() => {
        console.log(`${userId} is now offline`);
      })
      .catch((err) => {
        console.error(err);
      });
  });

  socket.on("logoutAll", () => {
    redisClient
      .keys("user-*")
      .then((keys) => {
        // For each key in Redis, set its value to false to mark the user as offline
        keys.forEach((key) => {
          redisClient.del(key);
          // Emit a "logout" event to all connected sockets to notify them that the user has logged out
          socket.broadcast.emit("logout", key);
        });
      })
      .then(() => {
        console.log("All users have been logged out");
      })
      .catch((err) => {
        console.error(err);
      });
    socket.emit("loggedOut", "All user logged out");
  });

  socket.on("place-bet", (bet) => {
    if (bet.parentStr) {
      bet.parentStr.map((parent: any) => {
        socket.to(`${parent}-${bet.matchId}`).emit("placedBet", bet);
      });
    }
  });

  socket.on("on-rollback-place-bet", (bet) => {
    console.log("rollback call", bet);
    if (bet.userId) {
      socket.to(`${bet.userId}-${bet.matchId}`).emit("placedBet", bet);
    }
  });

  socket.on("updateExposer", ({ exposer, balance, userId }) => {
    console.log("expopppp", exposer, balance, userId);
    io.sockets.to(`user-${userId}`).emit("updateExposer", { exposer, balance });
  });

  socket.on("betDelete", ({ betId, userId }) => {
    io.to(`user-${userId}`).emit("betDelete", { betId });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});

redisReplica.subscribe("saveCasinoData", (message: any) => {
  const data = JSON.parse(message);

  axios
    .post(`${process.env.CLIENT_NODE_URL}/save-casino-match`, {
      data: {
        mid: data.mid,
        gameType: data.gameType,
        ...{ ...data.data, status: "processing" },
      },
    })
    .then(() => {})
    .catch((err: any) => console.log("save casino match", err.stack));
});
