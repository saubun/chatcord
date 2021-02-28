const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
	userJoin,
	getCurrentuser,
	userLeave,
	getRoomUsers,
} = require('./utils/users');
const moment = require('moment');
const botName = 'ChatCord Bot';

// Run on http server instead
const app = express();
const server = http.createServer(app);

// Init socket.io
const io = socketio(server);

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Run when a client connects
io.on('connection', (socket) => {
	// Joining room
	socket.on('joinRoom', ({ username, room }) => {
		// Join room
		const user = userJoin(socket.id, username, room);
		socket.join(user.room);

		// Emit a message event, catch on client side (broadcasts to client only)
		socket.emit('message', formatMessage(botName, 'Welcome to chatcord!'));

		// Broadcast to everyone but the user connecting
		socket.broadcast
			.to(user.room)
			.emit(
				'message',
				formatMessage(botName, `${user.username} has joined the chat`)
			);

		// Send users and room info
		io.to(user.room).emit('roomUsers', {
			room: user.room,
			users: getRoomUsers(user.room),
		});
	});

	// Listen for chat message
	socket.on('chatMessage', (msg) => {
		const user = getCurrentuser(socket.id);
		io.to(user.room).emit('message', formatMessage(user.username, msg));
	});

	// When a client disconnects
	socket.on('disconnect', () => {
		const user = userLeave(socket.id);

		if (user) {
			io.to(user.room).emit(
				'message',
				formatMessage(botName, `${user.username} has left the chat`)
			);
			// Send users and room info
			io.to(user.room).emit('roomUsers', {
				room: user.room,
				users: getRoomUsers(user.room),
			});
		}
	});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	'192.168.0.3';
	console.log(
		`Server running on port ${PORT} at ${moment().format('MM-DD-YY h:m:s A')}`
	);
});
