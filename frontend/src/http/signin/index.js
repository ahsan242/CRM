import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { loginSchema } from "@/pages/auth/LoginForm";
import { signIn } from "../services/authService";

const useSignIn = () => {
  const form = useForm({
    resolver: yupResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: signIn,
    onSuccess: (data) => {
      // ✅ store token in localStorage
      localStorage.setItem("token", data.token);
      console.log("Login success", data);
    },
    onError: (error) => {
      console.error("Login failed", error.response?.data || error.message);
    },
  });

  const login = form.handleSubmit((values) => {
    mutation.mutate(values);
  });

  return {
    ...form,
    login,
    loading: mutation.isPending,
  };
};

export default useSignIn;
