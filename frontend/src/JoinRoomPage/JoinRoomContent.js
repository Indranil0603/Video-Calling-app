import React, { useState } from "react";
import JoinRoomInputs from "./JoinRoomInputs";
import OnlyWithAudioCheckbox from "./OnlyWithAudioCheckbox";
import { connect } from "react-redux";
import {
	setConnectOnlyWithAudio,
	setIdentity,
	setRoomId,
} from "../store/actions";
import ErrorMessage from "./ErrorMessage";
import JoinRoomButtons from "./JoinRoomButtons";
import { getRoomExits } from "../utils/api";
import { useHistory } from "react-router-dom";

const JoinRoomContent = (props) => {
	const {
		isRoomHost,
		setConnectOnlyWithAudio,
		connectOnlyWithAudio,
		setIdentityAction,
		setRoomIdAction,
	} = props;
	const [roomIdValue, setRoomIdValue] = useState("");
	const [nameValue, setNameValue] = useState("");
	const [errorMessage, setErrorMessage] = useState(null);

	const history = useHistory();

	const handleJoinRoom = async () => {
		setIdentityAction(nameValue);
		if (isRoomHost) {
			createRoom();
		} else {
			await joinRoom();
		}
	};

	const joinRoom = async () => {
		const responseMessage = await getRoomExits(roomIdValue);

		const { roomExists, full } = responseMessage;

		if (roomExists) {
			if (full) {
				setErrorMessage("Meeting is full.Please try again later.");
			} else {
				//join a room !
				//save in our reduxt store the meeting id which was provided by the user whicich would like to join
				setRoomIdAction(roomIdValue);
				history.push("/room");
			}
		} else {
			setErrorMessage("Meeting not found, Check your meeting id");
		}
	};

	const createRoom = () => {
		history.push("/room");
	};
	return (
		<>
			<JoinRoomInputs
				roomIdValue={roomIdValue}
				setRoomIdValue={setRoomIdValue}
				nameValue={nameValue}
				setNameValue={setNameValue}
				isRoomHost={isRoomHost}
			/>
			<OnlyWithAudioCheckbox
				setConnectOnlyWithAudio={setConnectOnlyWithAudio}
				connectOnlyWithAudio={connectOnlyWithAudio}
			/>
			<ErrorMessage errorMessage={errorMessage} />
			<JoinRoomButtons
				isRoomHost={isRoomHost}
				handleJoinRoom={handleJoinRoom}
			/>
		</>
	);
};

const mapStoreStateToProps = (state) => {
	return {
		...state,
	};
};

const mapActionsToProps = (dispatch) => {
	return {
		setConnectOnlyWithAudio: (onlyWithAudio) =>
			dispatch(setConnectOnlyWithAudio(onlyWithAudio)),
		setIdentityAction: (identity) => dispatch(setIdentity(identity)),
		setRoomIdAction: (roomId) => dispatch(setRoomId(roomId)),
	};
};

export default connect(
	mapStoreStateToProps,
	mapActionsToProps
)(JoinRoomContent);
