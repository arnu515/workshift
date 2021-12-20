import Axios from 'axios';

const axios = Axios.create({
	baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
	headers: {
		Accept: 'application/json'
	},
	validateStatus: () => true,
	withCredentials: true
});

export default axios;
