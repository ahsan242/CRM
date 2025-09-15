// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import { useMutation } from "@tanstack/react-query";
// import { signupSchema } from "@/pages/auth/SignupForm";
// import { signUp } from "../services/authService";

// const useSignUp = () => {
//   const form = useForm({
//     resolver: yupResolver(signupSchema),
//   });

//   const mutation = useMutation({
//     mutationFn: signUp,
//     onSuccess: (data) => {
//       console.log("Signup success", data);
//     },
//     onError: (error) => {
//       console.error("Signup failed", error.response?.data || error.message);
//     },
//   });

//   const register = form.handleSubmit((values) => {
//     mutation.mutate(values);
//   });

//   return {
//     ...form,
//     register,
//     loading: mutation.isPending,
//   };
// };

// export default useSignUp;

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { signupSchema } from "@/validations/signupSchema";  // ✅ Correct path
import { signUp } from "../services/authService";

const useSignUp = () => {
  const form = useForm({
    resolver: yupResolver(signupSchema),
  });

  const mutation = useMutation(signUp);

  const onSubmit = form.handleSubmit((data) => {
    mutation.mutate(data);
  });

  return {
    ...form,
    onSubmit,
    ...mutation,
  };
};

export default useSignUp;

