import { io } from "socket.io-client";

const casinoSocket = io(process.env.CASINO_SERVER!, {
  transports: ["websocket"],
});

casinoSocket.on("connect", () => {
  console.log("connected casino server");
  casinoSocket.emit("joinCasinoRoom", "result");
});

export function initCasinoSocket() {
  casinoSocket.on("result", (data: any) => {
    //console.log(data);
  });
}

export default casinoSocket;
