

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { signupSchema } from "@/validations/signupSchema";
import { useNotificationContext } from "@/context/useNotificationContext";
import { useAuthContext } from "@/context/useAuthContext";
import { useNavigate } from "react-router-dom";
import { useVerification } from "../useVerification";

const useSignUp = () => {
  const { showNotification } = useNotificationContext();
  const { saveSession } = useAuthContext();
  const navigate = useNavigate();
  const { initiateRegistration, verificationData, setVerificationData } = useVerification();

  const form = useForm({
    resolver: yupResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "customer",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    initiateRegistration.mutate(values);
  });

  const handleVerificationComplete = (data) => {
    showNotification({
      message: "Account created successfully! Welcome!",
      variant: "success",
    });

    form.reset();

    // Save session and redirect
    if (data.token && data.user) {
      saveSession({
        token: data.token,
        user: data.user,
      });
      navigate("/dashboard");
    } else {
      navigate("/auth/sign-in");
    }
  };

  return {
    ...form,
    onSubmit,
    loading: initiateRegistration.isPending,
    register: form.register,
    control: form.control,
    verificationData,
    setVerificationData,
    onVerificationComplete: handleVerificationComplete,
  };
};

export default useSignUp;