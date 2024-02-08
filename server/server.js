const express = require("express");
const http = require("http");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const twilio = require("twilio");
const { config } = require("dotenv");

config();

const PORT = process.env.PORT || 5002;
const app = express();
const server = http.createServer(app);

app.use(cors());

let connectedUsers = [];
let rooms = [];

app.get("/api/room-exists/:roomId", (req, res) => {
	const { roomId } = req.params;
	const room = rooms.find((room) => room.id === roomId);

	if (room) {
		//send response room exists
		if (room.connectedUsers.length > 3) {
			return res.send({ roomExists: true, full: true });
		} else {
			return res.send({ roomExists: true, full: false });
		}
	} else {
		//send response room does not exist
		return res.send({ roomExists: false });
	}
});

app.get('/api/get-turn-credentials', (req,res) =>{
	
	const accountSid = process.env.TWILIO_SID ;
	const authToken = process.env.TWILIO_AUTH_TOKEN;

	const client = twilio(accountSid, authToken);

	let responseToken = null;

	try {
		client.tokens.create().then(token =>{
			responseToken = token;
			res.send({token});
		})
	}catch (err) {
		console.log('error occured when fetching turn server credentials');
		console.log(err);
		res.send({ token: null });
	}
})
const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

io.on("connection", (socket) => {
	console.log(`Server is listening on ${socket.id}`);

	socket.on("create-new-room", (data) => {
		createNewRoomHandler(data, socket);
	});

	socket.on("join-room", (data) => {
		joinRoomHandler(data, socket);
	});

	socket.on("disconnect", () => {
		disconnectHandler(socket);
	});

	socket.on("conn-signal", (data) => {
		signalHandler(data, socket);
	});

	socket.on("conn-init", (data) => {
		
		initalizeConnectionHandler(data, socket);
	});

	socket.on("direct-message", (data)=>{
		console.log("direct-message came");
		console.log(data);
		directMessageHandler(data, socket);
	});	
});

const createNewRoomHandler = (data, socket) => {
	console.log("host is crating new room");
	

	const { identity, onlyAudio } = data;

	const roomId = uuidv4();

	//create new user
	const newUser = {
		identity,
		id: uuidv4(),
		socketId: socket.id,
		roomId,
		onlyAudio
	};

	// push that user to connected Users
	connectedUsers = [...connectedUsers, newUser];

	//create new room
	const newRoom = {
		id: roomId,
		connectedUsers: [newUser],
	};

	//join sokcet.io room
	socket.join(roomId);

	rooms = [...rooms, newRoom];

	//emit to that client which created that room with roomId
	socket.emit("room-id", { roomId });

	//emit and event to all the users connected to that room

	//about new users which are right now in this room
	socket.emit("room-update", { connectedUsers: newRoom.connectedUsers });
};

const joinRoomHandler = (data, socket) => {
	const { identity, roomId, onlyAudio } = data;

	const newUser = {
		identity,
		id: uuidv4(),
		socketId: socket.id,
		roomId,
		onlyAudio,
	};

	//join room as user which is trying to join room passing room id
	const room = rooms.find((room) => room.id === roomId);
	room.connectedUsers = [...room.connectedUsers, newUser];

	//joint socket io room
	socket.join(roomId);

	//add new user to connected users array
	connectedUsers = [...connectedUsers, newUser];

	//emit to all users whihc  are already in this rooom to prepare peer connection
	room.connectedUsers.forEach((user) => {
		if (user.socketId !== socket.id) {
			const data = {
				connUserSocketId: socket.id,
			};

			io.to(user.socketId).emit("conn-prepare", data);
		}
	});

	io.to(roomId).emit("room-update", { connectedUsers: room.connectedUsers });
};

const disconnectHandler = (socket) => {
	//find if user has been registered . if yes remove him from room and connected users array
	const user = connectedUsers.find((user) => user.socketId === socket.id);
	if (user) {
		//remove user from room in server
		const room = rooms.find((room) => room.id === user.roomId);

		room.connectedUsers = room.connectedUsers.filter(
			(user) => user.socketId !== socket.id
		);

		// leave socket io room
		socket.leave(user.roomId);

		//close the room is famount of the users which will stay in room will be 0
		//emit event to rest of the users which left in the room to new connected users in the room
		if (room.connectedUsers.length > 0) {
			//emit to all users which are still in the room that user disconnected
			io.to(room.id).emit("user-disconnected", { socketId: socket.id });

			io.to(room.id).emit("room-update", {
				connectedUsers: room.connectedUsers,
			});
		} else {
			rooms = rooms.filter((r) => r.id !== room.id);
		}

		//close the room is famount of the users which will stay in room will be 0
	}
};

const signalHandler = (data, socket) => {
	const { connUserSocketId, signal } = data;

	const signalingData = { signal, connUserSocketId: socket.id };

	io.to(connUserSocketId).emit("conn-signal", signalingData);
};

//infformation from clients whichi are already in room that They have prepared for incoming connection
const initalizeConnectionHandler = (data, socket) => {
	const { connUserSocketId } = data;
	const initData = { connUserSocketId: socket.id };
	
	io.to(connUserSocketId).emit("conn-init", initData);
};

const directMessageHandler = (data, socket)=>{
	if (connectedUsers.find(connUser=> connUser.socketId === data.receiverSocketId)) {
		const receiverData = {
			authorSocketId: socket.id,
			messageContent: data.messageContent,
			isAuthor: false,
			identity: data.identity
		};

		socket.to(data.receiverSocketId).emit('direct-message', receiverData);

		const authorData = {
			receiverSocketId: data.receiverSocketId,
			messageContent: data.messageContent,
			isAuthor: true,
			identity: data.identity,
		}

		socket.emit('direct-message',authorData);
	}
}
server.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
});
