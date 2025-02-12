import axios from "axios";

// 헤더에 토큰 값이 필요가 없을 때
const webClient = axios.create({
  baseURL: `https://meebot.site/`,
});

export default webClient;
