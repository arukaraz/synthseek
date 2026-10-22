import http from "node:http";

const emit = http.Server.prototype.emit;

http.Server.prototype.emit = function emitWithPeerAddress(event, request, ...rest) {
  if ((event === "request" || event === "upgrade") && request.socket.remoteAddress) {
    const prior = request.headers["x-forwarded-for"];
    const peer = request.socket.remoteAddress;
    request.headers["x-forwarded-for"] = prior ? `${prior}, ${peer}` : peer;
  }
  return emit.call(this, event, request, ...rest);
};
