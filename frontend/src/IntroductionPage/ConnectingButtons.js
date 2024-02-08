import React from "react";
import ConnectingButton from "./ConnectingButton";
import { useHistory } from "react-router-dom/cjs/react-router-dom";
const ConnectingButtons = () => {
	let history = useHistory();

	const pushToJoinRoomPage = () => {
		console.log("Navigating the join room");
		history.push("/join-room");
	};
	const pushToJoinRoomPageAsHost = () => {
		history.push("/join-room?host=true");
	};

	return (
		<div className="connecting_buttons_container">
			<ConnectingButton
				buttonText="Join a meeting"
				onclickHandler={pushToJoinRoomPage}
			/>
			<ConnectingButton
				createRoomButton={true}
				buttonText="Host a meeting"
				onclickHandler={pushToJoinRoomPageAsHost}
			/>
		</div>
	);
};

export default ConnectingButtons;
