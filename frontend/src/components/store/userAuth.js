import { defineStore } from "pinia";
import axios from "axios";
import router from "../../router.js";

export const useAuthStore = defineStore("authentication", {
  state: () => ({
    token: "",
    // initialize state from local storage to enable user to stay logged in
    // user: JSON.parse(localStorage.getItem("user")),
    errorLogIn: false,
    isAuthenticated: false,
    errorRegister: false,
  }),
  actions: {
    async login(username, password) {
      const params = new URLSearchParams();
      params.append("username", username);
      params.append("password", password);

      const headers = {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      };
      await axios
        .post("user/jwt/create/", params, {
          headers: headers,
        })
        .then((response) => {
          // store user details and jwt in local storage to keep user logged in between page refreshes
          localStorage.setItem("user", JSON.stringify(response.data));
          // update pinia state
          this.token = response.data["access"];
          this.isAuthenticated = true;
          router.push({ name: "Home" });
        })
        .catch((error) => {
          console.log(error);
          this.errorLogIn = true;
        });
    },
    async register(payload) {
      await axios
        .post("user/register/", payload, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          router.push({ name: "Authorization" });
          console.log(
            `User ${response.data.username} has been successfully created!`
          );
        })
        .catch((error) => {
          console.log(error);
          this.errorRegister = error.response.data.detail;
        });
    },
    logout() {
      this.token = null;
      localStorage.removeItem("user");
      this.isAuthenticated = false;
      location.reload();
    },

    async refreshToken() {
      var user = localStorage.getItem("user");
      user = JSON.parse(user);
      const refresh = user["refresh_token"];
      localStorage.removeItem("user");

      const refreshToken = await axios.get("user/jwt/refresh/", {
        headers: {
          Authorization: "Bearer " + refresh,
        },
      });
      // reassign user in local storage
      user["access_token"] = refreshToken.data.access_token;
      localStorage.setItem("user", JSON.stringify(user));
      return refreshToken.data.access_token;
    },

    clearError() {
      this.errorLogIn = false;
    },
  },
  persist: {
    enabled: true,
  },
});
