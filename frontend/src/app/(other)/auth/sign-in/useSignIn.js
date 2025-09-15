import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as yup from "yup";
import { useAuthContext } from "@/context/useAuthContext";
import { useNotificationContext } from "@/context/useNotificationContext";
import httpClient from "@/helpers/httpClient";
import api from "@/http/api";

const useSignIn = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { saveSession } = useAuthContext();
  const [searchParams] = useSearchParams();
  const { showNotification } = useNotificationContext();

  // ✅ validation schema
  const loginFormSchema = yup.object({
    email: yup.string().email("Please enter a valid email").required("Please enter your email"),
    password: yup.string().required("Please enter your password"),
  });

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // ✅ redirect handler
  const redirectUser = () => {
    const redirectLink = searchParams.get("redirectTo");
    if (redirectLink) navigate(redirectLink);
    else navigate("/");
  };

  // ✅ login function
  const login = handleSubmit(async values => {
  setLoading(true);
  try {
    const res = await api.post("/api/users/login", values);

    if (res.data.token) {
      saveSession({
        token: res.data.token,
        user: res.data.user, // <-- new: store user object
      });

      redirectUser();
      showNotification({
        message: `Welcome ${res.data.user.name}! Redirecting...`,
        variant: 'success',
      });
    }
  } catch (e) {
    if (e.response?.data?.error) {
      showNotification({
        message: e.response.data.error,
        variant: 'danger',
      });
    }
  } finally {
    setLoading(false);
  }
});


  return {
    loading,
    login,
    control,
  };
};

export default useSignIn;
