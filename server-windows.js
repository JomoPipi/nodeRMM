const express = require("express");
const app = express();
const http = require("http").createServer(app);
const WebSocket = require("ws");
const { spawn, execSync, exec } = require("child_process");

const wss = new WebSocket.Server({ server: http });

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

wss.on("connection", (ws) => {
  console.log("new websocket connection");

  // If any ffmpeg processes are running, just close them and
  // let the user refresh the page to see the stream.
  let foundProcess = false;
  exec("tasklist | findstr ffmpeg", (err, stdout) => {
    // console.log('stdout string',stdout.toString())
    const processes = stdout
      .split("\n")
      .filter((line) => line.includes("ffmpeg"));
    if (processes.length > 0) foundProcess = true;
    // console.log({processes})
    for (const process of processes) {
      const pid = process.trim().split(/\s+/)[1];
      // console.log({pid})
      execSync(`taskkill /PID ${pid} /F`);
    }
    // if (foundProcess) return // just reload the page to see the stream.

    createStream();
  });

  function createStream() {
    // prettier-ignore
    const ffmpeg = spawn('ffmpeg', [
      '-f', 'gdigrab', // Use GDI for screen capture
      '-framerate', '4',
      '-hwaccel', 'dxva2', // try to reduce flickering
      '-i', 'desktop', // To capture the desktop
      '-draw_mouse', '1', // try to reduce flickering
      '-c:v', 'libvpx',
      '-pix_fmt', 'yuv420p', 
      '-b:v', '100k', 
      '-vf', 'scale=1280:-1', // Scale keeping aspect ratio
      '-f', 'webm', // Output format
      '-' // Output to stdout
      ]);

    // const ffmpeg = spawn('ffmpeg', [
    //   '-f', 'dshow', // Use dshow to get rid of mouse flickering
    //   '-i', 'video="screen-capture-recorder"', // make this work
    //   '-framerate', '10',
    //   '-c:v', 'libvpx',
    //   '-b:v', '100k',
    //   '-vf', 'scale=1280:-1', // Scale keeping aspect ratio
    //   '-f', 'webm', // Output format
    //   'pipe:1' // Output to stdout
    //   ]);

    ffmpeg.stdout.on("data", (data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });

    ffmpeg.stderr.on("data", (data) => {
      // console.log(`FFmpeg stderr: ${data}`);
    });

    ffmpeg.on("exit", (code, signal) => {
      // ffmpeg = null; // Reset ffmpeg reference on exit
    });

    ws.on("close", () => {
      ffmpeg.kill();
      // ffmpeg = null; // Reset ffmpeg reference on close
    });

    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };
  }
});

http.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000 and accessible remotely");
});
