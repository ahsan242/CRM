import * as yup from "yup";

export const signupSchema = yup.object({
  username: yup.string().required("Please enter your user name"),
  email: yup.string().email("Please enter a valid email").required("Please enter your email"),
  password: yup.string().required("Please enter your password"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match"),
});
