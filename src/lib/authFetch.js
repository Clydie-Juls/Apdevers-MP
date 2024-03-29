export async function fetchWithTokenRefresh(fetchCallback) {
  try {
    // Attempt the initial fetch call
    const response = await fetchCallback();

    // Assuming the response is JSON and includes a message field
    const data = await response.json();

    if (data.message === "TokenExpiredError") {
      // If token expired, request a new access token
      const refreshResponse = await fetch("/api/account/token", {
        method: "POST",
        credentials: "include", // Assuming the refresh token is sent via cookies
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        // Store the new access token in session storage
        sessionStorage.setItem("accessToken", refreshData.accessToken);

        // Retry the original fetch call with the new access token
        // Assuming the fetchCallback can handle using the updated token from session storage
        return fetchWithTokenRefresh(fetchCallback);
      } else {
        // If unable to refresh token, redirect to login
        return response;
        // window.location.href = "/login";
      }
    } else if (data.message === "Unauthorized") {
      // Redirect to login if unauthorized
      return response;
    } else {
      // If no errors, return the original data
      return { response: response, data: data };
    }
  } catch (error) {
    console.error("Fetch with token refresh failed:", error);
  }
}
