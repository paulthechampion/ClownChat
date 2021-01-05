const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const indexRoute = require('./routes/index');

app.set('view engine', 'ejs');
app.set('layout', 'layouts/layout');

app.use(expressLayouts);
app.use(express.static('public'));

const server=app.listen(2000, ()=>{
   console.log("Listening to port 2000") 
});


const socket=require("socket.io");

const io = socket(server)
const users={};
io.on('connection', socket=>{
   
socket.on('new-user',name=>{
    users[socket.id] =name;
    socket.broadcast.emit('user-connected', name);
});
socket.on('send-chat-message',message=>{
    socket.broadcast.emit('chat-message',{message:message, name:users[socket.id]});
});
socket.on('disconnect',()=>{
    socket.broadcast.emit('user-disconnect',users[socket.id]);
    delete users[socket.id];
});

});

app.use('/',indexRoute);
;