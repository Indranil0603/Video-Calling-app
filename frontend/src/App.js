import React, { useEffect } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import JoinRoomPage from "./JoinRoomPage/JoinRoomPage";
import RoomPage from "./RoomPage/RoomPage";
import IntroductionPage from "./IntroductionPage/IntroductionPage";
import { connectWithSocketyIOSever } from "./utils/wss";

import "./App.css";

function App() {
	useEffect(() => {
		connectWithSocketyIOSever();
	}, []);
	return (
		<BrowserRouter>
			<Switch>
				<Route path="/join-room" exact>
					<JoinRoomPage />
				</Route>
				<Route path="/room" exact>
					<RoomPage />
				</Route>
				<Route path="/" exact>
					<IntroductionPage />
				</Route>
			</Switch>
		</BrowserRouter>
	);
}

export default App;
