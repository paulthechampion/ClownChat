if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const indexRoute = require('./routes/index');
const mongoose = require('mongoose');
const session = require('express-session')
const MongoStore = require("connect-mongo")(session)


app.set('view engine', 'ejs');
app.set('layout', 'layouts/layout');

app.use(expressLayouts);
app.use(express.static('public'));

app.use(session({
    secret:"mysupersecret", 
    resave:false,
     saveUninitialized:false,
    store:new MongoStore({mongooseConnection:mongoose.connection}),
    cookie:{maxAge:180 * 60 * 1000}
}))

app.use((req,res,next)=>{
    
    res.locals.session = req.session
    next()
})

mongoose.connect(process.env.DATABASE_URL,{
    useUnifiedTopology:true, useNewUrlParser:true
});

const db= mongoose.connection;
db.on('error',error=>console.error(error));
db.once('open',()=>console.log('Connected to mongoose'));


const server=app.listen(process.env.PORT ||2000, ()=>{
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
