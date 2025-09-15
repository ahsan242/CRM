import api from "../api";

// Sign up
export const signUp = async (data) => {
  const res = await api.post("/api/users", data);
  return res.data;
};

// Sign in
export const signIn = async (data) => {
  const res = await api.post("/api/users/login", data);
  return res.data;
};

// Log out
export const logout = async () => {
  const res = await api.post("/api/users/logout");
  return res.data;
};
