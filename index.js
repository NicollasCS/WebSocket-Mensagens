const { WebSocketServer } = require('ws');

const server = new WebSocketServer({ port: 3002 });

const users = {};
const rooms = {};

function send(ws, data) {
    if (ws && ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(data));
    }
}

function broadcastRooms() {
    const roomList = Object.keys(rooms);

    Object.values(users).forEach(user => {
        if (user.socket) {
            send(user.socket, {
                action: "rooms",
                rooms: roomList
            });
        }
    });
}

function updateMembers(room) {
    if (!rooms[room]) return;

    const members = [...rooms[room]];

    members.forEach(login => {
        const user = users[login];
        if (user?.socket) {
            send(user.socket, {
                action: "members",
                room,
                members
            });
        }
    });
}

function removeFromRooms(login) {
    for (const room in rooms) {
        if (rooms[room].has(login)) {
            rooms[room].delete(login);

            if (rooms[room].size === 0) {
                delete rooms[room];
            } else {
                updateMembers(room);
            }
        }
    }

    broadcastRooms();
}

server.on("connection", (client) => {

    client.on("message", (msg) => {
        let data;

        try {
            data = JSON.parse(msg);
        } catch {
            return;
        }

        // ===================
        // REGISTRAR
        // ===================
        if (data.action === "register") {

            if (!data.login || !data.password) {
                return send(client, {
                    action: "error",
                    msg: "Preencha usuário e senha."
                });
            }

            if (users[data.login]) {
                return send(client, {
                    action: "error",
                    msg: "Usuário já existe."
                });
            }

            users[data.login] = {
                password: data.password,
                socket: null
            };

            return send(client, {
                action: "success",
                msg: "Cadastro realizado."
            });
        }

        // ===================
        // LOGIN
        // ===================
        if (data.action === "login") {

            const user = users[data.login];

            if (!user || user.password !== data.password) {
                return send(client, {
                    action: "error",
                    msg: "Login inválido."
                });
            }

            user.socket = client;
            client.login = data.login;
            client.currentRoom = null;

            send(client, {
                action: "success",
                msg: "Login realizado."
            });

            broadcastRooms();

            return;
        }

        // precisa logar
        if (!client.login) {
            return send(client, {
                action: "error",
                msg: "Faça login primeiro."
            });
        }

        // ===================
        // CRIAR SALA
        // ===================
        if (data.action === "create_room") {

            if (!data.room) {
                return send(client, {
                    action: "error",
                    msg: "Digite o nome da sala."
                });
            }

            if (rooms[data.room]) {
                return send(client, {
                    action: "error",
                    msg: "Sala já existe."
                });
            }

            rooms[data.room] = new Set();

            broadcastRooms();

            return send(client, {
                action: "success",
                msg: "Sala criada."
            });
        }

        // ===================
        // ENTRAR SALA
        // ===================
        if (data.action === "join_room") {

            if (!rooms[data.room]) {
                return send(client, {
                    action: "error",
                    msg: "Sala não encontrada."
                });
            }

            rooms[data.room].add(client.login);
            client.currentRoom = data.room;

            send(client, {
                action: "joined_room",
                room: data.room
            });

            updateMembers(data.room);

            return;
        }

        // ===================
        // MENSAGEM
        // ===================
        if (data.action === "room_message") {

            const room = client.currentRoom;

            if (!room) return;

            rooms[room].forEach(login => {
                const user = users[login];

                if (user?.socket) {
                    send(user.socket, {
                        action: "chat_message",
                        sender: client.login,
                        text: data.text,
                        room
                    });
                }
            });

            return;
        }

        // ===================
        // DESCONECTAR
        // ===================
        if (data.action === "disconnect") {

            removeFromRooms(client.login);

            const user = users[client.login];

            if (user) user.socket = null;
        }

    });

    client.on("close", () => {
        if (client.login) {
            removeFromRooms(client.login);

            const user = users[client.login];

            if (user) user.socket = null;
        }
    });

});

console.log("Servidor rodando na porta 3002");