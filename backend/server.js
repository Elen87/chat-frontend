import { randomUUID } from "node:crypto";
import http from "node:http";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { WebSocketServer } from "ws";

const app = express();
app.use(cors());
app.use(bodyParser.json());

let users = [];

app.post("/new-user", (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ status: "error", message: "Name required" });
  }
  
  const exists = users.find(u => u.name === name);
  if (exists) {
    return res.status(409).json({ status: "error", message: "Name already taken!" });
  }
  
  const newUser = { id: randomUUID(), name };
  users.push(newUser);
  console.log(`✅ User joined: ${name}`);
  res.json({ status: "ok", user: newUser });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  ws.send(JSON.stringify(users));
  
  ws.on("message", (msg) => {
    const data = JSON.parse(msg);
    
    if (data.type === "exit") {
      users = users.filter(u => u.name !== data.user.name);
      wss.clients.forEach(client => {
        if (client.readyState === 1) client.send(JSON.stringify(users));
      });
      console.log(`👋 User left: ${data.user.name}`);
    } else if (data.type === "send") {
      wss.clients.forEach(client => {
        if (client.readyState === 1) client.send(msg);
      });
      console.log(`💬 Message from ${data.user.name}: ${data.message}`);
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Backend on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket on ws://localhost:${PORT}`);
})
