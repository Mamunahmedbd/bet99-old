import { Server } from "http";
import { Server as SocketIO } from "socket.io";

const WEBSOCKET_CORS = {
  origin: "*",
  methods: ["GET", "POST"],
};

class Websocket extends SocketIO {
  private static io: Websocket;

  constructor(httpServer: Server) {
    super(httpServer, {
      cors: WEBSOCKET_CORS,
      transports: ["websocket", "polling"],
    });
  }

  public static getInstance(httpServer?: Server): Websocket {
    if (!Websocket.io) {
      Websocket.io = new Websocket(httpServer!);
    }

    return Websocket.io;
  }
}

export default Websocket;
