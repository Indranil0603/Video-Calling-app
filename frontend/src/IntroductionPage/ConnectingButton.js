import React from "react";

const ConnectingButton = ({
	createRoomButton = false,
	buttonText,
	onclickHandler,
}) => {
	const buttonClass = createRoomButton
		? "create_room_button"
		: "join_room_button";

	return (
		<button className={buttonClass} onClick={onclickHandler}>
			{buttonText}
		</button>
	);
};

export default ConnectingButton;
