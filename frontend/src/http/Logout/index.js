import { useMutation } from "@tanstack/react-query";
import { logout } from "../services/authService";

const useLogout = () => {
  const mutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      localStorage.removeItem("token");
      console.log("Logged out");
    },
    onError: (error) => {
      console.error("Logout failed", error.response?.data || error.message);
    },
  });

  return {
    logout: mutation.mutate,
    loading: mutation.isPending,
  };
};

export default useLogout;
