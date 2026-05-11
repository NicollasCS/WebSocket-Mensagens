const { WebSocketServer } = require('ws');

const server = new WebSocketServer({ port: 3002 });

const users = {};
const rooms = {};

function send(ws, payload) {
    if (ws && ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(payload));
    }
}

function broadcastRooms() {
    const roomNames = Object.keys(rooms);
    const payload = { action: 'rooms', rooms: roomNames };
    Object.values(users).forEach((user) => {
        if (user.socket) send(user.socket, payload);
    });
}

function updateRoomMembers(room) {
    const members = rooms[room] ? [...rooms[room]] : [];
    const payload = { action: 'members', room, members };
    members.forEach((login) => {
        const user = users[login];
        if (user && user.socket) send(user.socket, payload);
    });
}

function removeUserFromRooms(login) {
    Object.keys(rooms).forEach((room) => {
        if (rooms[room].has(login)) {
            rooms[room].delete(login);
            if (rooms[room].size === 0) {
                delete rooms[room];
            } else {
                updateRoomMembers(room);
            }
        }
    });
    broadcastRooms();
}

server.on('connection', (client) => {
    client.on('message', (message) => {
        let data;
        try {
            data = JSON.parse(message);
        } catch (error) {
            return;
        }

        if (data.action === 'register') {
            if (!data.login || !data.password) {
                return send(client, { action: 'error', msg: 'Login e senha são obrigatórios.' });
            }
            if (users[data.login]) {
                return send(client, { action: 'error', msg: 'Usuário já cadastrado.' });
            }
            users[data.login] = { password: data.password, socket: null };
            return send(client, { action: 'success', msg: 'Cadastro realizado com sucesso.' });
        }

        if (data.action === 'login') {
            const user = users[data.login];
            if (!user || user.password !== data.password) {
                return send(client, { action: 'error', msg: 'Login ou senha incorretos.' });
            }
            user.socket = client;
            client.login = data.login;
            client.currentRoom = null;
            send(client, { action: 'success', msg: 'Login realizado.', rooms: Object.keys(rooms) });
            broadcastRooms();
            return;
        }

        if (data.action === 'list_rooms') {
            return send(client, { action: 'rooms', rooms: Object.keys(rooms) });
        }

        if (!client.login) {
            return send(client, { action: 'error', msg: 'Usuario não autenticado.' });
        }

        if (data.action === 'create_room') {
            if (!data.room) {
                return send(client, { action: 'error', msg: 'Nome da sala é obrigatório.' });
            }
            if (!rooms[data.room]) {
                rooms[data.room] = new Set();
                broadcastRooms();
                return send(client, { action: 'success', msg: `Sala '${data.room}' criada.` });
            }
            return send(client, { action: 'error', msg: 'Sala já existe.' });
        }

        if (data.action === 'join_room') {
            if (!data.room || !rooms[data.room]) {
                return send(client, { action: 'error', msg: 'Sala não encontrada.' });
            }
            rooms[data.room].add(client.login);
            client.currentRoom = data.room;
            send(client, { action: 'joined_room', room: data.room });
            updateRoomMembers(data.room);
            return;
        }

        if (data.action === 'room_message') {
            const room = client.currentRoom;
            if (!room || !rooms[room] || !rooms[room].has(client.login)) {
                return send(client, { action: 'error', msg: 'Você precisa entrar em uma sala antes de enviar mensagens.' });
            }
            const text = data.text || '';
            const targets = Array.isArray(data.targets) ? data.targets.filter(Boolean) : [];
            const isDirect = targets.length > 0;
            const finalTargets = new Set(isDirect ? [...targets, client.login] : [...rooms[room]]);

            finalTargets.forEach((login) => {
                if (!rooms[room].has(login)) return;
                const user = users[login];
                if (user && user.socket) {
                    send(user.socket, {
                        action: 'chat_message',
                        room,
                        sender: client.login,
                        text,
                        direct: isDirect,
                        targets,
                    });
                }
            });
            return;
        }

        if (data.action === 'disconnect') {
            if (client.login) {
                removeUserFromRooms(client.login);
            }
            return;
        }
    });

    client.on('close', () => {
        if (client.login) {
            removeUserFromRooms(client.login);
            const user = users[client.login];
            if (user) user.socket = null;
        }
    });
});
