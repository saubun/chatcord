// Allow socket on the front end
const socket = io();

// Gets chat form, listen to this
const chatForm = document.getElementById('chat-form');

// Chat messages div
const chatMessages = document.querySelector('.chat-messages');

// Room name
const roomName = document.getElementById('room-name');

// Get user list
const userList = document.getElementById('users');

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
	ignoreQueryPrefix: true,
});

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
	outputRoomName(room);
	outputUsers(users);
});

// Catch message event from server
socket.on('message', (message) => {
	console.log(message);
	outputMessage(message);

	// Scroll down to most rcent message
	chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Listener for chat form
chatForm.addEventListener('submit', (e) => {
	e.preventDefault();

	// Get text input from form
	const msg = e.target.elements.msg.value;

	// Emit the message to server
	socket.emit('chatMessage', msg);

	// Clear input on send
	e.target.elements.msg.value = '';
	e.target.elements.msg.focus();
});

// Function to output message to DOM
function outputMessage(message) {
	const div = document.createElement('div');
	div.classList.add('message');
	div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
	<p class="text">
		${message.text}
	</p>`;
	document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
	roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
	userList.innerHTML = `
		${users.map((user) => `<li>${user.username}</li>`).join('')}
	`;
}
