let server = null;
let currentRoom = null;
let targetMode = 'all';

const authStatus = document.getElementById('authStatus');
const app = document.getElementById('app');
const loginScreen = document.getElementById('loginScreen');

const roomList = document.getElementById('roomList');
const memberList = document.getElementById('memberList');
const recipientSection = document.getElementById('recipientSection');
const recipientList = document.getElementById('recipientList');
const currentRoomName = document.getElementById('currentRoomName');
const chatBox = document.getElementById('chatBox');

function serverConnect() {
    server = new WebSocket('ws://127.0.0.1:3002');

    server.onopen = () => {
        authStatus.textContent = 'Conectado ao servidor.';
    };

    server.onclose = () => {
        authStatus.textContent = 'Desconectado.';
        loginScreen.classList.remove('hidden');
        app.classList.add('hidden');
    };

    server.onmessage = (sock) => {
        const data = JSON.parse(sock.data);

        if (data.action === 'success') {
            authStatus.textContent = data.msg;

            if (data.msg.includes('Login')) {
                loginScreen.classList.add('hidden');
                app.classList.remove('hidden');
            }

            return;
        }

        if (data.action === 'error') {
            authStatus.textContent = data.msg;
            return;
        }

        if (data.action === 'rooms') {
            updateRoomList(data.rooms);
            return;
        }

        if (data.action === 'joined_room') {
            currentRoom = data.room;
            currentRoomName.textContent = data.room;
            return;
        }

        if (data.action === 'members') {
            updateMemberList(data.members);
            return;
        }

        if (data.action === 'chat_message') {
            chatBox.innerHTML += `
                <div class="received">
                    <small>${data.sender}</small>
                    <p>${data.text}</p>
                </div>
            `;
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    };
}

function serverDisconnect() {
    if (server) {
        server.close();
    }
}

function registerUser() {
    const login = user.value.trim();
    const password = passwordInput();

    server.send(JSON.stringify({
        action: 'register',
        login,
        password
    }));
}

function loginUser() {
    const login = user.value.trim();
    const password = passwordInput();

    server.send(JSON.stringify({
        action: 'login',
        login,
        password
    }));
}

function passwordInput(){
    return document.getElementById('password').value.trim();
}

function createRoom() {
    const room = roomName.value.trim();

    server.send(JSON.stringify({
        action: 'create_room',
        room
    }));

    roomName.value = '';
}

function joinRoom(room) {
    server.send(JSON.stringify({
        action: 'join_room',
        room
    }));
}

function updateRoomList(rooms) {
    roomList.innerHTML = '';

    rooms.forEach(room => {
        const btn = document.createElement('button');
        btn.textContent = room;
        btn.onclick = () => joinRoom(room);
        roomList.appendChild(btn);
    });
}

function updateMemberList(members) {
    memberList.innerHTML = '';

    members.forEach(member => {
        memberList.innerHTML += `<div>${member}</div>`;
    });
}

function updateTargetMode() {
    targetMode = document.querySelector('input[name="targetMode"]:checked').value;

    if (targetMode === 'selected') {
        recipientSection.classList.remove('hidden');
    } else {
        recipientSection.classList.add('hidden');
    }
}

function serverSend() {
    const text = message.value.trim();

    server.send(JSON.stringify({
        action: 'room_message',
        text
    }));

    message.value = '';
}