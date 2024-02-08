import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { connect } from "react-redux";
import "./JoinRoomPage.css";
import { setIsRoomHost } from "../store/actions";
import JoinRoomTitle from "./JoinRoomTitle";
import JoinRoomContent from "./JoinRoomContent";

const JoinRoomPage = (props) => {
	const { setIsRoomHostAction, isRoomHost } = props;

	const search = useLocation().search;

	useEffect(() => {
		const isRoomHost = new URLSearchParams(search).get("host");
		if (isRoomHost) {
			// setting in our redux store that user is host
			setIsRoomHostAction(true);
		}
	}, []);
	return (
		<div className="join_room_page_container">
			<div className="join_room_page_panel">
				<JoinRoomTitle isRoomHost={isRoomHost} />
				<JoinRoomContent isRoomHost={isRoomHost} />
			</div>
		</div>
	);
};

const mapStoreStateToProps = (state) => {
	return {
		...state,
	};
};

const mapActionStateToProps = (dispatch) => {
	return {
		setIsRoomHostAction: (isRoomHost) => dispatch(setIsRoomHost(isRoomHost)),
	};
};

export default connect(
	mapStoreStateToProps,
	mapActionStateToProps
)(JoinRoomPage);
