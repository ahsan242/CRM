import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { signupSchema } from "@/validations/signupSchema";

import { signUp } from "../services/authService";
import { useNotificationContext } from "@/context/useNotificationContext";
import { useAuthContext } from "@/context/useAuthContext";
import { useNavigate } from "react-router-dom";

const useSignUp = () => {
  const { showNotification } = useNotificationContext();
  const { saveSession } = useAuthContext();
  const navigate = useNavigate();

  const form = useForm({
    resolver: yupResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
    },
  });

  const mutation = useMutation({
    mutationFn: signUp,
    onSuccess: (data) => {
      showNotification({
        message: "Signup successful!",
        variant: "success",
      });

       // ✅ clear all form fields after success
      form.reset();

      // auto-login if backend sends token
      if (data.token) {
        saveSession({
          token: data.token,
          user: data.user,
        });
        navigate("/dashboard");
      } else {
        navigate("/auth/sign-in");
      }
    },
    onError: (error) => {
      showNotification({
        message: error.response?.data?.error || "Signup failed",
        variant: "danger",
      });
      form.resetField("password");
      form.resetField("confirmPassword");
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate(values);
  });

  return {
    ...form,
    onSubmit,
    loading: mutation.isPending,
    register: form.register,
    control: form.control,
  };
};

export default useSignUp;
