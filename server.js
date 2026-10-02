const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { WebcastPushConnection } = require('tiktok-live-connector');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

let tiktokLiveConnection;

io.on('connection', (socket) => {
    socket.on('setUniqueId', (uniqueId) => {
        if (tiktokLiveConnection) {
            tiktokLiveConnection.disconnect();
        }

        tiktokLiveConnection = new WebcastPushConnection(uniqueId);

        tiktokLiveConnection.connect().then(state => {
            socket.emit('connected', state);
        }).catch(err => {
            socket.emit('error', err);
        });

        tiktokLiveConnection.on('gift', data => {
            socket.emit('gift', data);
        });

        tiktokLiveConnection.on('chat', data => {
            socket.emit('chat', data);
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
