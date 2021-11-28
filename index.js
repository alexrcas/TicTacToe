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

