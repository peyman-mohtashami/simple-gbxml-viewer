import axios from "axios";
//import { toast } from "react-toastify";
//import auth from "./authService";

axios.interceptors.response.use(null, error => {
	const expectedError =
		error.response &&
		error.response.status >= 400 &&
		error.response.status < 500;
	if (!expectedError) {
		console.log("Unexpected error occured.", error);
		//toast.error(`Unexpected error occured. ${error}`);
	} else {
		console.log("Expected error occured.", error.response);
		//toast.warn(`Expected error occured! ${error.response.status}`);
	}

	return Promise.reject(error);
});

export function setJwt(jwt) {
	axios.defaults.headers.common["x-auth-token"] = jwt;
}

export default {
	get: axios.get,
	post: axios.post,
	put: axios.put,
	delete: axios.delete,
	setJwt
};
