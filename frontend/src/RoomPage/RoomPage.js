import React, { useEffect } from "react";
import ParticipantsSection from "./ParticipantsSection/ParticipantsSection";
import VideoSection from "./VideoSection/VideoSection";
import ChatSection from "./ChatSection/ChatSection";
import { connect } from "react-redux";
import * as webRTCHandler from "../utils/webRTCHandler";
import "./RoomPage.css";
import RoomLabel from "./RoomLabel";
import Overlay from "./Overlay";
const RoomPage = ({
	roomId,
	identity,
	isRoomHost,
	showOverlay,
	connectOnlyWithAudio,
}) => {
	useEffect(() => {
		if (!isRoomHost && !roomId) {
			const siteUrl = window.location.origin;
			window.location.href = siteUrl;
		} else {
			webRTCHandler.getlocalPreviewAndInitRoomConnection(
				isRoomHost,
				identity,
				roomId,
				connectOnlyWithAudio
			);
		}
	}, []);

	return (
		<div className="room_container">
			<ParticipantsSection />
			<VideoSection />
			<ChatSection />
			<RoomLabel roomId={roomId} />
			{showOverlay && <Overlay />}
		</div>
	);
};

const mapStoreStateToProps = (state) => {
	return {
		...state,
	};
};
export default connect(mapStoreStateToProps)(RoomPage);
