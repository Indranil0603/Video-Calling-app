import React, { useState } from "react";
import SwitchImg from "../../resources/images/switchToScreenSharing.svg";
import LocalScreenSharingPreview from "./LocalScrenSharingPreview";
import * as webRTCHandler from "../../utils/webRTCHandler";
const constraints = {
	audio: false,
	video: true,
};

const SwitchToScreenSharingButton = () => {
	const [isScreenSharingActive, setIsScreenSharingActive] = useState(false);
	const [screenSharingStream, setScreenSharingStream] = useState(null);

	const handleScreenShareToggle = async () => {
		if (!isScreenSharingActive) {
			let stream = null;
			try {
				stream = await navigator.mediaDevices.getDisplayMedia(constraints);
			} catch (err) {
				console.log(
					"error occured when trying to access screen sharing stream"
				);
			}
			if (stream) {
				setScreenSharingStream(stream);
				webRTCHandler.toggleScreenShare(isScreenSharingActive, stream);
				setIsScreenSharingActive(true);
				//execute here fucntion to switch the video tracks which we are sendint to other user
			}
		} else {
			//switch for video track from camera
			webRTCHandler.toggleScreenShare(isScreenSharingActive);
			setIsScreenSharingActive(false);

			//stop screen share stream
			screenSharingStream.getTracks().forEach((t) => t.stop());
			setScreenSharingStream(null);
		}

		// setIsScreenSharingActive(!isScreenSharingActive);
	};

	return (
		<>
			<div className="video_button_container">
				<img
					src={SwitchImg}
					onClick={handleScreenShareToggle}
					className="video_button_image"
				/>
			</div>
			{isScreenSharingActive && (
				<LocalScreenSharingPreview stream={screenSharingStream} />
			)}
		</>
	);
};

export default SwitchToScreenSharingButton;
