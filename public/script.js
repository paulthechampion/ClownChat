const socket= io();
const messageForm= document.getElementById("send-container");
const messageInput= document.getElementById("message-input");
const messageCont= document.getElementById("message-container");


messageForm.addEventListener('submit', e=>{
    e.preventDefault()
    const message= messageInput.value;
    socket.emit('send-chat-message', message);
    messageInput.value='';
    appendMessg(`You:${message}`);
});

function appendMessg(message){
    const messageElement =document.createElement('div');
    messageElement.innerText= message;
    messageCont.append(messageElement);
};
//user name
const name=prompt('What is your name?');
appendMessg('You joined');
socket.emit('new-user', name);

socket.on('user-connected',name=>{
    appendMessg(`${name} connected`);
});

socket.on('user-disconnect',name=>{
    appendMessg(`${name} disconnected`);
});


socket.on('chat-message', data=>{
    appendMessg(`${data.name}:${data.message}`);
});

