import { fetchWithTokenRefresh } from "./authFetch";
import { useParams } from "react-router";

export const Account = {
  async isLoggedIn() {
    const details = await this.getDetails();
    console.log("Sepkasepak", details);
    return details;
  },

  async getDetails() {
    try {
      const { response, data } = await fetchWithTokenRefresh(() =>
        fetch(`/api/account/logincheck`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        })
      );

      console.log("Data:", data);
      if (response.ok) {
        return data.user;
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

    await fetch(`/api/account/logout/${id}`, {
      method: "post",
    });
  },
};
