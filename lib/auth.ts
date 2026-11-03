export function saveToken(token: string) {
  localStorage.setItem("token", token);
}

export function saveUser(user: object) {
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

// kept for backwards compat — no longer needed but harmless
export async function saveTokenAndRedirect(token: string, user: object) {
  saveToken(token);
  saveUser(user);
  window.location.href = "/dashboard";
}
