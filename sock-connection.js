let server = null;
let currentRoom = null;
let targetMode = 'all';

const authStatus = document.getElementById('authStatus');
const app = document.getElementById('app');
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
        document.getElementById('connect').classList.add('hidden');
        document.getElementById('disconnect').classList.remove('hidden');
    };

    server.onclose = () => {
        authStatus.textContent = 'Desconectado.';
        document.getElementById('connect').classList.remove('hidden');
        document.getElementById('disconnect').classList.add('hidden');
        app.classList.add('hidden');
        currentRoom = null;
        currentRoomName.textContent = 'Nenhuma';
        roomList.innerHTML = '';
        memberList.innerHTML = '';
        recipientList.innerHTML = '';
    };

    server.onmessage = (sock) => {
        const data = JSON.parse(sock.data);

        if (data.action === 'success') {
            authStatus.textContent = data.msg;
            if (data.rooms) {
                app.classList.remove('hidden');
                updateRoomList(data.rooms);
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
            authStatus.textContent = `Entrou na sala ${data.room}`;
            return;
        }

        if (data.action === 'members') {
            if (data.room === currentRoom) {
                updateMemberList(data.members);
            }
            return;
        }

        if (data.action === 'chat_message') {
            const targetText = data.direct ? ` (Privada para ${data.targets.join(', ')})` : ' (Todos)';
            chatBox.innerHTML += `<div class="received"><small><label>${data.sender}${targetText}</label></small><p>${data.text}</p></div>`;
            chatBox.scrollTop = chatBox.scrollHeight;
            return;
        }
    };
}

function serverDisconnect() {
    if (server != null) {
        server.send(JSON.stringify({ action: 'disconnect' }));
        server.close();
    }
}

function registerUser() {
    if (!server || server.readyState !== WebSocket.OPEN) {
        authStatus.textContent = 'Conecte ao servidor primeiro.';
        return;
    }

    const login = document.getElementById('user').value.trim();
    const password = document.getElementById('password').value.trim();
    if (!login || !password) {
        authStatus.textContent = 'Informe usuário e senha para cadastrar.';
        return;
    }

    server.send(JSON.stringify({ action: 'register', login, password }));
}

function loginUser() {
    if (!server || server.readyState !== WebSocket.OPEN) {
        authStatus.textContent = 'Conecte ao servidor primeiro.';
        return;
    }

    const login = document.getElementById('user').value.trim();
    const password = document.getElementById('password').value.trim();
    if (!login || !password) {
        authStatus.textContent = 'Informe usuário e senha para fazer login.';
        return;
    }

    server.send(JSON.stringify({ action: 'login', login, password }));
}

function createRoom() {
    if (!server || server.readyState !== WebSocket.OPEN) {
        authStatus.textContent = 'Servidor não conectado.';
        return;
    }

    const roomName = document.getElementById('roomName').value.trim();
    if (!roomName) {
        authStatus.textContent = 'Informe o nome da sala.';
        return;
    }

    server.send(JSON.stringify({ action: 'create_room', room: roomName }));
    document.getElementById('roomName').value = '';
}

function joinRoom(room) {
    if (!server || server.readyState !== WebSocket.OPEN) {
        authStatus.textContent = 'Servidor não conectado.';
        return;
    }
    server.send(JSON.stringify({ action: 'join_room', room }));
}

function updateRoomList(rooms) {
    roomList.innerHTML = '';
    if (!rooms || rooms.length === 0) {
        roomList.textContent = 'Nenhuma sala disponível.';
        return;
    }

    rooms.forEach((room) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = room;
        button.onclick = () => joinRoom(room);
        roomList.appendChild(button);
    });
}

function updateMemberList(members) {
    memberList.innerHTML = '';
    recipientList.innerHTML = '';

    members.forEach((member) => {
        const item = document.createElement('div');
        item.textContent = member;
        memberList.appendChild(item);

        if (member !== document.getElementById('user').value.trim()) {
            const option = document.createElement('label');
            option.innerHTML = `<input type="checkbox" value="${member}"> ${member}`;
            recipientList.appendChild(option);
        }
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
    if (!server || server.readyState !== WebSocket.OPEN) {
        authStatus.textContent = 'Servidor não conectado.';
        return;
    }

    if (!currentRoom) {
        authStatus.textContent = 'Entre em uma sala antes de enviar mensagens.';
        return;
    }

    const text = document.getElementById('message').value.trim();
    if (!text) {
        authStatus.textContent = 'Digite uma mensagem.';
        return;
    }

    const payload = { action: 'room_message', text };
    if (targetMode === 'selected') {
        const selected = Array.from(recipientList.querySelectorAll('input[type="checkbox"]:checked')).map((input) => input.value);
        payload.targets = selected;
    } else {
        payload.targets = [];
    }

    server.send(JSON.stringify(payload));
    document.getElementById('message').value = '';
}
