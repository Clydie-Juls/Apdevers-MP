import { fetchWithTokenRefresh } from "./authFetch";
import { useParams } from "react-router";

export const Account = {
  async isLoggedIn() {
    const details = await this.getDetails();
    return details;
  },

  async getDetails() {
    try {
      const { response, data } = await fetchWithTokenRefresh(
        () =>
          fetch(`/api/account/logincheck`, {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
            },
          }),
        false
      );

      if (response.ok) {
        return data;
      } else {
        console.log("Response not OK");
        return null;
      }
    } catch (error) {
      console.error("Error fetching details:", error);
      return null;
    }
  },

  async logout() {
    const details = await this.getDetails();
    const id = details.id;
    sessionStorage.removeItem("accessToken");
    await fetch(`/api/account/logout/${id}`, {
      method: "post",
    });
  },
};
