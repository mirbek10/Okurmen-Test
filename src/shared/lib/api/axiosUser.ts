import axios from "axios";
import { API_URL, attachSession } from "./session";

export const axiosUser = attachSession(axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "*/*",
  },
}), "user");
