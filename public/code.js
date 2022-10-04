(function(){

    const app = document.querySelector(".app");
    const socket = io();
        
    let uname;

    app.querySelector(".join-screen #join-user").addEventListener("click", function(){
        let username = app.querySelector(".join-screen #username").value;
        if(username.length == 0){
            return;
        }
        socket.emit("newuser",username);
        uname = username;
        app.querySelector(".join-screen").classList.remove("active");
        app.querySelector(".rooms").classList.add("active");
    });  

    app.querySelector(".rooms #create-room").addEventListener("click", function(){
        let roomname = app.querySelector(".rooms #roomname").value;
        if(roomname.length == 0){
            return;
        }
        socket.emit("newroom",roomname);
    }); 

    app.querySelector(".rooms #join-room").addEventListener("click", function(){
        let selection = app.querySelector("#rooms-dropdown");
        let selectedRoom = selection.options[selection.selectedIndex].value;
        if(selectedRoom == null){
            return;
        }
        socket.emit("selectroom", selectedRoom)
        socket.emit("newUserJoined",uname, selectedRoom);
        app.querySelector(".logo").innerText = "ROOM NAME: "+selectedRoom
        app.querySelector(".rooms").classList.remove("active");
        app.querySelector(".chat-screen").classList.add("active");
    });
    
    app.querySelector(".rooms #join-private-chat").addEventListener("click", function(){
        let selection = app.querySelector("#clients-dropdown");
        let selectedClient = selection.options[selection.selectedIndex].value;
        if(selectedClient == null){
            return;
        }
        socket.emit("selectclient", selectedClient)
        app.querySelector(".logo").innerText = "PRIVATE CHAT"
        app.querySelector(".rooms").classList.remove("active");
        app.querySelector(".chat-screen").classList.add("active");
    }); 
    
    app.querySelector(".chat-screen #send-message").addEventListener("click",function(){
        let message = app.querySelector(".chat-screen #message-input").value;
        if(message.length == 0){
            return;
        }
        renderMessage("my",{
            username:uname,
            text:message
        });
        socket.emit("chat",{
            username:uname,
            text:message
        });
        app.querySelector(".chat-screen #message-input").value = "";
    });

    

    function renderMessage(type, message){
        let messageContainer = app.querySelector(".chat-screen .messages");
        if(type =="my"){
            let el = document.createElement("div");
            el.setAttribute("class", "message my-message");
            el.innerHTML = `
                <div>
                    <div class="name">You</div>
                    <div class="text">${message.text}</div>
                </div>
            `;
            messageContainer.appendChild(el);
        } else if(type == "other"){
            let el = document.createElement("div");
            el.setAttribute("class", "message other-message");
            el.innerHTML = `
                <div>
                    <div class="name">${message.username}</div>
                    <div class="text">${message.text}</div>
                </div>
            `;
            messageContainer.appendChild(el);
        } else if (type == "userJoinedRoom") {
            let el = document.createElement("div");
            el.setAttribute("class", "update");
            el.innerText = message;
            messageContainer.appendChild(el);
        }
        // scroll chat to end 
        messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight;
    }


    app.querySelector(".chat-screen #exit-chat").addEventListener("click",function(){
        socket.emit("exituser",uname);
        window.location.href = window.location.href;

    });

    socket.on("update",function(update){
        renderMessage("update",update);
    });

    socket.on("userJoinedRoom",function(userStatus){
        renderMessage("userJoinedRoom",userStatus);
    });

    socket.on("chat",function(message){
        renderMessage("other",message);
    });

    socket.on("roomsData",function(roomList){
        let selection = app.querySelector("#rooms-dropdown");
        selection.innerHTML = ""
        roomList.forEach(function(item){
            let roomOption = document.createElement("option");
            roomOption.value = item;
            roomOption.innerText = item;
            selection.appendChild(roomOption);
        })        
    }); 
    
    socket.on("clientsData",function(clientList){
        let selection = app.querySelector("#clients-dropdown");
        selection.innerHTML = ""
        clientList.forEach(function(item){
            if(uname != item){
                let clientOption = document.createElement("option");
                clientOption.value = item;
                clientOption.innerText = item;
                selection.appendChild(clientOption);
            }
        })
    });

    socket.on("newrooms",function(roomName){
        let roomOption = document.createElement("option");
        roomOption.value = roomName;
        roomOption.innerText = roomName;
        let selection = app.querySelector("#rooms-dropdown");
        selection.appendChild(roomOption);
    });

    socket.on("selectclient",function(clientName){
        app.querySelector(".logo").innerText = "PRIVATE CHAT"
        app.querySelector(".rooms").classList.remove("active");
        app.querySelector(".chat-screen").classList.add("active");
    });

    socket.on("selectrooms",function(roomName){
        app.querySelector(".logo").innerText = "ROOM NAME: "+selectedRoom
        app.querySelector(".rooms").classList.remove("active");
        app.querySelector(".private-screen").classList.add("active");
    })
})();