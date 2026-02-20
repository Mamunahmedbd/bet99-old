import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.SUPER_NODE_URL!}/api/`,
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => {
    // You can modify the response data here
    const { config } = response;
    // if (
    //   config?.params?.retry &&
    //   response.data.sports &&
    //   response.data.sports.length <= 0
    // ) {
    //   config.params.retry -= 1;
    //   console.log("called", config.params.retry);
    //   return new Promise((resolve) => {
    //     setTimeout(() => resolve(api(config)), 0); // Retry after 1 second
    //   });
    // }

    return response;
  },
  (error) => {
    // Retry the request if it failed

    return Promise.reject(error);
  }
);

export default api;
