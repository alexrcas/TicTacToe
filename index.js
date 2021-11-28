'use strict'

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const cors = require('cors');
const path = require('path');

app.use(cors());
app.use(express.static('public'));


server.listen(3000, () => { console.log('Server listening at 3000!'); })


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
})


io.on('connection', socket => {
    console.log('client connected!')

    socket.on('create-room', async (roomCode) => {

        let allSockets = await socket.in(roomCode).allSockets();
        let numberOfClientsInRoom = allSockets.size;
        if (numberOfClientsInRoom > 0) {
            console.log(`No se puede crear la sala. Ya existe una sala con nombre ${roomCode}`)
            socket.emit('create-room', 'error')
            return;
        }

        socket.join(roomCode);
        io.to(roomCode).emit('create-room', roomCode)
    })


    socket.on('join-room', async (roomCode) => {
        let allSockets = await socket.in(roomCode).allSockets();
        let numberOfClientsInRoom = allSockets.size;
        if (numberOfClientsInRoom < 1) {
            console.log(`El cliente no puede unirse a la sala porque no se ha creado. Cód. sala: ${roomCode}`)
            socket.emit('join-room', 'error');
            return;
        }
        if (numberOfClientsInRoom > 1) {
            console.log(`La sala está llena. Cód. sala: ${roomCode}`)
            socket.emit('join-room', 'error');
            return;
        }

        socket.join(roomCode);
        socket.emit('join-room', roomCode);
        io.to(roomCode).emit('start-game')
    });

    socket.on('movement', async(movement) => {
        io.to(movement.sala).emit('movement', movement);
    });

    socket.on('keep-alive', async (roomCode) => {
        let allSockets = await socket.in(roomCode).allSockets();
        io.to(roomCode).emit('keep-alive', allSockets.size);
        if (allSockets.size < 2) {
            socket.leave(roomCode);
        }
    });

    socket.on('chat-message', async(message) => {
        io.in(message.sala).emit('chat-message', {jugador: message.jugador, mensaje: message.mensaje});
    });

})