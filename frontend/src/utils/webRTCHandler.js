import { setMessages, setShowOverlay } from "../store/actions";
import store from "../store/store";
import { fetchTURNCredentials, getTurnIceServers } from "./turn";
import * as wss from "./wss";
import Peer from "simple-peer";

const defaultConstraints = {
	audio: true,
	video: {
		height: "480",
		video: "360",
	},
};

const onlyAudioConstraints = {
	audio: true,
	vidoe: false,
};

let localStream;
export const getlocalPreviewAndInitRoomConnection = async (
	isRoomHost,
	identity,
	roomId = null,
	onlyAudio
) => {
	await fetchTURNCredentials();
	const constraints = onlyAudio ? onlyAudioConstraints : defaultConstraints;

	navigator.mediaDevices
		.getUserMedia(constraints)
		.then((stream) => {
			console.log("successfully receivced localstream");
			localStream = stream;
			showLocalVideoPreview(localStream);

			store.dispatch(setShowOverlay(false));
			//dispatch an action to hide overlay

			isRoomHost
				? wss.createNewRoom(identity, onlyAudio)
				: wss.joinRoom(identity, roomId, onlyAudio);
		})
		.catch((err) => {
			console.log("Error getting user media: ", err);
		});
};

let peers = {};
let streams = [];

const getConfiguration = () => {
	const turnIceServers = getTurnIceServers();

	if(turnIceServers){
		
		return {
			iceServers: [
				{
					urls: process.env.REACT_APP_STUN_SERVER_GOOGLE,
				},
				...turnIceServers
			],
		};
	}else{
		console.warn('Using only STUN server');
		return {
			iceServers: [
				{
					urls: process.env.REACT_APP_STUN_SERVER_GOOGLE,
				},
			],
		};
	}

};

const messengerChannel = "messenger";

export const prepareNewPeerConnection = (connUserSocketId, isInitiator) => {
	const configuration = getConfiguration();
	// peer object made
	peers[connUserSocketId] = new Peer({
		initiator: isInitiator,
		config: configuration,
		stream: localStream,
		channelName: messengerChannel,
	});

	peers[connUserSocketId].on("signal", (data) => {
		//webRTC offer , webRTC Answer (SDP information ), ice candidates

		const signalData = {
			signal: data,
			connUserSocketId: connUserSocketId,
		};

		wss.signalPeerData(signalData);
	});

	peers[connUserSocketId].on("stream", (stream) => {
		console.log("new stream came");

		addStream(stream, connUserSocketId);

		streams = [...streams, stream];
	});

	peers[connUserSocketId].on("data", (data) => {
		const messageData = JSON.parse(data);
		appendNewMessage(messageData);
	});

	peers[connUserSocketId].on("error", (err) => {
		console.error("Peer connection error:", err);
		// Handle the error, e.g., retry or inform the user
	});
};

export const handleSignalingData = (data) => {
	// add signaling data to peer connection
	peers[data.connUserSocketId].signal(data.signal);
};

export const removePeerConnection = (data) => {
	const { socketId } = data;
	const videoContainer = document.getElementById(socketId);
	const videoEl = document.getElementById(`${socketId}-video`);

	if (videoContainer && videoEl) {
		const tracks = videoEl.srcObject.getTracks();

		tracks.forEach((t) => t.stop());
		videoEl.srcObject = null;
		videoContainer.removeChild(videoEl);

		videoContainer.parentNode.removeChild(videoContainer);

		if (peers[socketId]) {
			peers[socketId].destroy();
		}

		delete peers[socketId];
	}
};
//UI Videos
const showLocalVideoPreview = (stream) => {
	const videosContainer = document.getElementById("videos_portal");
	videosContainer.classList.add("videos_portal_styles");
	const videoContainer = document.createElement("div");
	videoContainer.classList.add("video_track_container");
	const videoElement = document.createElement("video");
	videoElement.autoplay = true;
	videoElement.muted = true;
	videoElement.srcObject = stream;

	videoElement.onloadedmetadata = () => {
		videoElement.play();
	};

	videoContainer.appendChild(videoElement);

	if (store.getState().connectOnlyWithAudio) {
		videoContainer.appendChild(getAudioOnlyLabel());
	}
	videosContainer.appendChild(videoContainer);
};
const addStream = (stream, connUserSocketId) => {
	//display incoming stream
	const videosContainer = document.getElementById("videos_portal");
	const videoContainer = document.createElement("div");
	
	videoContainer.id = connUserSocketId;

	videoContainer.classList.add("video_track_container");
	const videoElement = document.createElement("video");
	videoElement.autoplay = true;
	videoElement.srcObject = stream;
	videoElement.id = `${connUserSocketId}-video`;

	videoElement.onloadedmetadata = () => {
		videoElement.play();
	};

	videoElement.addEventListener("click", () => {
		if (videoElement.classList.contains("full_screen")) {
			videoElement.classList.remove("full_screen");
		} else {
			videoElement.classList.add("full_screen");
		}
	});

	videoContainer.appendChild(videoElement);

	//check if other user connected only with audio
	const participants = store.getState().participants;
	const participant = participants.find((p) => p.socketId === connUserSocketId);
	
	if (participant?.onlyAudio) {
		videoContainer.appendChild(getAudioOnlyLabel(`- ${participant.identity}`));
	}else{
		videoContainer.style.position = "static";
	}
	videosContainer.appendChild(videoContainer);
};

const getAudioOnlyLabel = (identity="") => {
	const labelContainer = document.createElement("div");
	labelContainer.classList.add("label_only_audio_container");

	const label = document.createElement("p");
	label.classList.add("label_only_audio_text");
	label.innerHTML = `Only audio ${identity} `;

	labelContainer.appendChild(label);
	return labelContainer;
};
//Buttons logic//

export const toggleMic = (isMuted) => {
	localStream.getAudioTracks()[0].enabled = isMuted ? true : false;
};

export const toggleCamera = (isDisabled) => {
	localStream.getVideoTracks()[0].enabled = isDisabled ? true : false;
};

export const toggleScreenShare = (
	isScreenSharingActive,
	screenSharingStream = null
) => {
	if (isScreenSharingActive) {
		switchVideoTracks(localStream);
	} else {
		switchVideoTracks(screenSharingStream);
	}
};

export const switchVideoTracks = (stream) => {
	for (let socket_id in peers) {
		for (let index in peers[socket_id].streams[0].getTracks()) {
			for (let index2 in stream.getTracks()) {
				if (
					peers[socket_id].streams[0].getTracks()[index].kind ===
					stream.getTracks()[index2].kind
				) {
					peers[socket_id].replaceTrack(
						peers[socket_id].streams[0].getTracks()[index],
						stream.getTracks()[index2],
						peers[socket_id].streams[0]
					);
					break;
				}
			}
		}
	}
};

///Messages///
const appendNewMessage = (messageData) => {
	const messages = store.getState().messages;
	store.dispatch(setMessages([...messages, messageData]));
};

export const sendMessagesUsingDataChannel = (messageContent) => {
	const identity = store.getState().identity;
	//append this mesage locally
	const localMessageData = {
		content: messageContent,
		identity,
		messageCreatedByMe: true,
	};

	appendNewMessage(localMessageData);
	const messageData = {
		content: messageContent,
		identity,
	};

	const stringifiedMessageData = JSON.stringify(messageData);
	for (let socketId in peers) {
		peers[socketId].send(stringifiedMessageData);
	}
};
