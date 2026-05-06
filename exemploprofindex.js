require('dotenv').config();

const database = require('./src/config/database');
database.authenticate();

const ws = require('ws');
let server = new ws.Server({ port: 3001});
const User = require('./src/models/user');

let logedUsers = {};

server.on("connection", (client)=> {
    client.on('message', async (msg) => {
        let data = JSON.parse(msg);

        if (data.action == 'register') {
            let user = await User.create({ login: data.login});
            await user.save();
            client.send(JSON.stringify({ success: true, msg: 'User registred!' }));
        } else if (data.action == 'message_to') {
        } else if (data.action == 'login') {
            let user = await User.findOne({ login: action.login });
            if(user == null) {
                client.send(JSON.stringify({ success: false, msg: 'User not found!' }));
            } else {
                logedUsers[data.login] = client;
                client['logRef'] = user.login;
            }
        }
    });

    client.on('close', () => {
        delete logedUsers[client['logRef']];
    });
});