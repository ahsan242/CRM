import api from "../api";

// Sign up
export const signUp = async (formData) => {
  const response = await api.post("/api/users/register", formData);
  return response.data; // backend should return { message, user, token? }
};

// Sign in
export const signIn = async (data) => {
  const response = await api.post("/api/users/login", data);
  return response.data;
};

// Log out
export const logout = async () => {
  const response = await api.post("/api/users/logout");
  return response.data;
};
