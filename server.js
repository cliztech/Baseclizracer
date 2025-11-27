/* eslint-env node */
/* global require, console */
const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', ws => {
  ws.on('message', message => {
    for (const client of wss.clients) {
      if (client.readyState === 1) {
        client.send(message.toString());
      }
    }
  });
});

console.log('WebSocket server running on ws://localhost:8080');
