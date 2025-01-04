const express = require("express");
const app = express();
const http = require("http").createServer(app);
const WebSocket = require("ws");
const { spawn } = require("child_process");

const wss = new WebSocket.Server({ server: http });

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

console.log("ahh");
wss.on("connection", (ws) => {
  // macos settings
  // prettier-ignore
  const ffmpeg = spawn('ffmpeg', [
      '-f', 'avfoundation',
      '-pix_fmt', 'uyvy422',
      '-i', '1:none',
      '-f', 'webm',
      '-c:v', 'libvpx',
      '-b:v', '1M',
      '-deadline', 'realtime',
      '-cpu-used', '4',
      '-vf', 'scale=1280:-1',
      '-'
    ]);

  ffmpeg.stdout.on("data", (data) => {
    // console.log("data");
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });

  ffmpeg.stderr.on("data", (data) => {
    console.log(`FFmpeg stderr: ${data}`);
  });

  ws.on("close", () => {
    ffmpeg.kill();
  });

  ws.onerror = (error) => {
    console.error("WebSocket Error:", error);
  };
});

http.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000 and accessible remotely");
});
