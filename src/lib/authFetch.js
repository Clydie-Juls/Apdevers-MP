export async function fetchWithTokenRefresh(
  fetchCallback,
  willRedirect = true
) {
  try {
    // Attempt the initial fetch call
    const response = await fetchCallback();

    // Assuming the response is JSON and includes a message field
    const data = await response.json();

    console.log(response, sessionStorage.getItem("accessToken"));

    if (data.message === "TokenRefreshNeed") {
      // If token expired, request a new access token
      const refreshResponse = await fetch("/api/account/token", {
        method: "POST",
        credentials: "include", // Assuming the refresh token is sent via cookies
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log(
        "1",
        "/api/account/token",
        response,
        refreshResponse,
        refreshResponse.ok
      );
      console.log("1.5");
      const refreshData = await refreshResponse.json();
      console.log(refreshData);
      sessionStorage.setItem("accessToken", refreshData.accessToken);
      return fetchWithTokenRefresh(fetchCallback);
    } else if (data.message === "Unauthorized") {
      // Redirect to login if unauthorized
      // if (willRedirect) {
      //   window.location.href = "/login";
      // }
    } else {
      // If no errors, return the original data
      return { response: response, data: data };
    }
  } catch (error) {
    console.error("Fetch with token refresh failed:", error);
  }
}
