import React from "react";
import "./JoinRoomPage.css";

const JoinRoomTitle = ({ isRoomHost }) => {
	const titleText = isRoomHost ? "Host meeting" : "Join Meeting";
	return <p className="join_room_title">{titleText}</p>;
};

export default JoinRoomTitle;
