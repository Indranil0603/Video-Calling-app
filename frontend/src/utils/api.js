import axios from "axios";
// import { config } from "dotenv";

// config();

const serverApi= "http://localhost:5002/api";
// const serverApi = process.env.NODE_ENV === "production"
// 		? `${process.env.SERVER_ADDRESS_HOSTED}/api`
// 		: `${process.env.SERVER_ADDRESS_LOCAL}/api`;

export const getRoomExits = async (roomId) => {
	const response = await axios.get(`${serverApi}/room-exists/${roomId}`);
	return response.data;
};

export const getTURNCredentials = async () => {
	const response = await axios.get(`${serverApi}/get-turn-credentials`);
	return response.data;
};
