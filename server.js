const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { WebcastPushConnection } = require('tiktok-live-connector');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let placar = { golsA: 0, golsB: 0 };
let tiktokUsername = "cast_na_voz"; 

app.use(express.static(__dirname));

let tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);

tiktokLiveConnection.connect().then(state => {
    console.log(`Conectado na live de ${state.roomId}`);
}).catch(err => {
    console.error('Erro ao conectar na live:', err);
});

// Lê os comentários da live
tiktokLiveConnection.on('chat', data => {
    let texto = data.comment.toLowerCase();
    if (texto.includes('timea')) placar.golsA += 1;
    if (texto.includes('timeb')) placar.golsB += 1;
    io.emit('atualizarPlacar', placar);
});

// Lê os presentes da live (Exemplo: presente de ID 5655 vale 5 gols)
tiktokLiveConnection.on('gift', data => {
    if (data.giftType === 1 && !data.repeatEnd) return;
    
    if (data.giftId === 5655) {
        placar.golsA += 5 * data.repeatCount;
    }
    io.emit('atualizarPlacar', placar);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
