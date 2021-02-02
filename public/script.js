const socket= io();
const messageForm= document.getElementById("send-container");
const messageInput= document.getElementById("message-input");
const messageCont= document.getElementById("messages");


function scrollToBottom(){
    var message = document.querySelector("#messages").lastElementChild;
    message.scrollIntoView()
}

messageForm.addEventListener('submit', e=>{
    e.preventDefault()
    const date =new Date()
    const formattedTime = moment(date).format('LT')
    const message= messageInput.value;
    socket.emit('send-chat-message', message);
    messageInput.value='';
        const template = document.querySelector("#message-template").innerHTML;
        const html = Mustache.render(template,{
            user:"You",
            message:message,
            time:formattedTime
        })
        const div = document.createElement("div")
        div.classList.add("your-message")
        div.innerHTML =html
    
        document.querySelector("#messages").appendChild(div) 
       scrollToBottom()
});

document.querySelector("#send-location")
.addEventListener("click",function(){
   if(!navigator.geolocation){
      return alert('Loaction not surported by browser')
   }

   navigator.geolocation.getCurrentPosition(function(position){
    
    socket.emit("create-location-message",{
        lat: position.coords.latitude,
        lng: position.coords.longitude
    })

   },function(){
       alert("Unable to fetch location")
   })
})

function appendMessg(message){
    const messageElement = document.createElement('div');
    messageElement.innerText= message;
    messageElement.classList.add("you-joined")
    messageCont.append(messageElement);
};
//user name

appendMessg('You joined');


socket.on('connect', function() {
    let searchQuery = window.location.search.substring(1);
    let params = JSON.parse('{"' + decodeURI(searchQuery).replace(/&/g, '","').replace(/\+/g, ' ').replace(/=/g,'":"') + '"}');
    socket.emit('join', params, function(err) {
      if(err){
        alert(err);
        window.location.href = '/';
      }else {
        console.log('No Error');
      }
    })
  });

socket.on('disconnect',()=>{
    console.log("disconnected from serversss");
});



socket.on("admin-message",data=>{
    const formattedTime = moment(data.createdAt).format('LT')
    const template = document.querySelector("#message-template").innerHTML;
    const html = Mustache.render(template,{
        user:data.name,
        message:data.message,
        time:formattedTime
    })
    const div = document.createElement("div")
    div.innerHTML =html

    document.querySelector("#messages").appendChild(div) 
   scrollToBottom()
})
socket.on('chat-message', data=>{
    const formattedTime = moment(data.createdAt).format('LT')
    const template = document.querySelector("#message-template").innerHTML;
    const html = Mustache.render(template,{
        user:data.name,
        message:data.message,
        time:formattedTime
    })
    const div = document.createElement("div")
    div.innerHTML =html
    div.classList.add("their-message")
        div.innerHTML =html

    document.querySelector("#messages").appendChild(div) 
   scrollToBottom()
});

socket.on("location-message",data=>{
    const formattedTime = moment(data.createdAt).format('LT')
    let a =document.createElement('a');
    a.setAttribute("target","_blank")
    a.setAttribute("href",`https://www.google.com/m?q=${data.message}`)
    a.innerText= `This is my Location`;
    const template = document.querySelector("#message-template").innerHTML;
    const html = Mustache.render(template,{
        user:data.name,
        aMessage:"This is My Location",
        aHref:`https://www.google.com/maps/place/${data.message}`,
        time:formattedTime
    })
    const div = document.createElement("div")
    div.innerHTML =html

    document.querySelector("#messages").appendChild(div) 
   scrollToBottom()
})

socket.on("updateUserList",function(users){
    let ol=document.createElement("ol")

    users.forEach(function(user){
        let li = document.createElement("li")
        li.innerHTML =user
        ol.appendChild(li)
    })
    let userslist = document.querySelector("#sidebar")
    userslist.classList.add("userListClass")
    userslist.innerHTML=""
    userslist.appendChild(ol)
    
})