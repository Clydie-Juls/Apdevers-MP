export async function fetchWithTokenRefresh(
  fetchCallback,
  willRedirect = true
) {
  try {
    const response = await fetchCallback();

    if (response.headers.authorization) {
      sessionStorage.setItem("accessToken", response.headers.authorization);
    }

    console.log(response);
    if (response.status == 401 && willRedirect) {
      window.location.replace("/login");
    }

    let data;
    try {
      data = await response.json();
    } catch (e) {}

    return { response: response, data: data };
  } catch (error) {
    console.error("Fetch with token refresh failed:", error);
  }
}
