"use strict";
// Kept separate so the actual worker request policy can be regression-tested.
// A convenience guard for ordinary exercises, not a boundary against adversarial
// code in the same JavaScript realm. No application credentials belong here.
function createLabFetch(browserFetch, baseUrl) {
  return (resource, options = {}) => {
    const request =
      typeof Request !== "undefined" && resource instanceof Request
        ? resource
        : null;
    let target;
    try {
      target = new URL(request ? request.url : String(resource), baseUrl);
    } catch {
      return Promise.reject(new Error("Use a valid public GitHub API URL."));
    }
    const method = String(
      options.method ?? request?.method ?? "GET",
    ).toUpperCase();
    if (
      target.protocol !== "https:" ||
      target.hostname !== "api.github.com" ||
      target.port ||
      target.username ||
      target.password ||
      method !== "GET"
    ) {
      return Promise.reject(
        new Error(
          "This exercise helper only permits HTTPS GET requests to api.github.com.",
        ),
      );
    }
    const headers = new Headers(options.headers ?? request?.headers);
    if (headers.has("Authorization"))
      return Promise.reject(
        new Error(
          "Use public GitHub requests without credentials in this exercise.",
        ),
      );
    // Construct from the validated URL, not a Request with a hidden method/body.
    return browserFetch(target.href, {
      method: "GET",
      headers,
      credentials: "omit",
      redirect: "error",
      signal: options.signal ?? request?.signal,
    });
  };
}
