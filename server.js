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
const moment = require("moment")
const bodyParser = require("body-parser")
const {Users} = require("./user")

app.set('view engine', 'ejs');
app.set('layout', 'layouts/layout');

app.use(expressLayouts);
app.use(express.static('public'));
app.use(bodyParser.urlencoded({limit: '10mb', extended:false}))
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
let users=new Users()


io.on('connection', socket=>{
    
    socket.on('join', (params) => {
    
      
        socket.join(params.room);
        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, params.room);
    
        io.to(params.room).emit("updateUserList", users.getUserList(params.room));
        socket.emit('chat-message',{
            message:`Welcome to Clown chat, you are in ${params.room} room!` ,
            name:"Admin",
            createdAt:moment().valueOf()
        });
    
        socket.broadcast.to(params.room).emit('chat-message',{
            message:"New User Joined", 
            name:"Admin",
            createdAt:moment().valueOf()
        });;
   
    })
    
    
 
    socket.on('send-chat-message',message=>{
        let user= users.getUser(socket.id)

        if(user&& isRealString(message)){
            socket.broadcast.to(user.room).emit('chat-message',{
            message:message, 
            name:user.name,
            createdAt:moment().valueOf()
        });
    }
    });
    socket.on("create-location-message",(coords)=>{
        let user= users.getUser(socket.id)
        io.to(user.id).emit('location-message',{
            name:"You",
            message:"Sent your location",
            createdAt:moment().valueOf()
        })
        socket.broadcast.to(user.room).emit("location-message",{
            name:user.name,
            message:`${coords.lat}, ${coords.lng}`
        })
    })
    socket.on('disconnect',()=>{
        let user = users.removeUser(socket.id)

        if(user){
            io.to(user.room).emit("updateUserList",users.getUserList(user.room))
            socket.broadcast.to(user.room).emit('chat-message',{
            message:`${user.name} has left ${user.room} room`, 
            name:"Admin",
            createdAt:moment().valueOf()
        });
        
        }
        
  
    });



       
      
       
   
    
});


function isRealString(str){
    return typeof str === "string" && str.trim().length>0 
}

app.use('/',indexRoute);
