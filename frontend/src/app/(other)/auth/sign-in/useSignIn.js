// // import { yupResolver } from "@hookform/resolvers/yup";
// // import { useState } from "react";
// // import { useForm } from "react-hook-form";
// // import { useNavigate, useSearchParams } from "react-router-dom";
// // import * as yup from "yup";
// // import { useAuthContext } from "@/context/useAuthContext";
// // import { useNotificationContext } from "@/context/useNotificationContext";
// // import httpClient from "@/helpers/httpClient";
// // import api from "@/http/api";

// // const useSignIn = () => {
// //   const [loading, setLoading] = useState(false);
// //   const navigate = useNavigate();
// //   const { saveSession } = useAuthContext();
// //   const [searchParams] = useSearchParams();
// //   const { showNotification } = useNotificationContext();

// //   // ✅ validation schema
// //   const loginFormSchema = yup.object({
// //     email: yup.string().email("Please enter a valid email").required("Please enter your email"),
// //     password: yup.string().required("Please enter your password"),
// //   });

// //   const { control, handleSubmit } = useForm({
// //     resolver: yupResolver(loginFormSchema),
// //     defaultValues: {
// //       email: "",
// //       password: "",
// //     },
// //   });

// //   // ✅ redirect handler
// //   const redirectUser = () => {
// //     const redirectLink = searchParams.get("redirectTo");
// //     if (redirectLink) navigate(redirectLink);
// //     else navigate("/");
// //   };

// //   // ✅ login function
// //   const login = handleSubmit(async values => {
// //   setLoading(true);
// //   try {
// //     const res = await api.post("/api/users/login", values);

// //     if (res.data.token) {
// //       saveSession({
// //         token: res.data.token,
// //         user: res.data.user, // <-- new: store user object
// //       });

// //       redirectUser();
// //       showNotification({
// //         message: `Welcome ${res.data.user.name}! Redirecting...`,
// //         variant: 'success',
// //       });
// //     }
// //   } catch (e) {
// //     if (e.response?.data?.error) {
// //       showNotification({
// //         message: e.response.data.error,
// //         variant: 'danger',
// //       });
// //     }
// //   } finally {
// //     setLoading(false);
// //   }
// // });


// //   return {
// //     loading,
// //     login,
// //     control,
// //   };
// // };

// // export default useSignIn;


// // src/app/(other)/auth/sign-in/useSignIn.js
// import { yupResolver } from "@hookform/resolvers/yup";
// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import * as yup from "yup";
// import { useAuthContext } from "@/context/useAuthContext";
// import { useNotificationContext } from "@/context/useNotificationContext";
// import httpClient from "@/helpers/httpClient"; // uses baseURL + token interceptor

// const useSignIn = () => {
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();
//   const { saveSession } = useAuthContext();
//   const [searchParams] = useSearchParams();
//   const { showNotification } = useNotificationContext();

//   const loginFormSchema = yup.object({
//     email: yup.string().email("Please enter a valid email").required("Please enter your email"),
//     password: yup.string().required("Please enter your password"),
//   });

//   const { control, handleSubmit } = useForm({
//     resolver: yupResolver(loginFormSchema),
//     defaultValues: { email: "", password: "" },
//   });

//   const redirectUser = () => {
//     const redirectLink = searchParams.get("redirectTo");
//     if (redirectLink) navigate(redirectLink);
//     else navigate("/dashboard/analytics");
//   };

//   const login = handleSubmit(async (values) => {
//     setLoading(true);
//     try {
//       // hits http://localhost:5000/api/users/login (httpClient base + path)
//       const res = await httpClient.post("/api/users/login", values);

//       // Support multiple backend shapes
//       const token = res.data?.token || res.data?.accessToken || null;
//       const user = res.data?.user || res.data?.data || null;

//       if (token) {
//         saveSession({ token, user });
//         showNotification?.({ message: `Welcome ${user?.name || "User"}! Redirecting...`, variant: "success" });
//         redirectUser();
//       } else {
//         // backend didn't return token - show warning message
//         showNotification?.({ message: res.data?.message || "Login successful (no token returned)", variant: "warning" });
//       }
//     } catch (err) {
//       const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Login failed";
//       showNotification?.({ message: msg, variant: "danger" });
//     } finally {
//       setLoading(false);
//     }
//   });

//   return { loading, login, control };
// };

// export default useSignIn;


import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as yup from "yup";
import { useAuth } from "@/context/AuthContext"; // 👈 USE NEW HOOK
import { useNotificationContext } from "@/context/useNotificationContext";
import httpClient from "@/helpers/httpClient";

const useSignIn = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { saveSession } = useAuth(); // 👈 USE NEW AUTH HOOK
  const [searchParams] = useSearchParams();
  const { showNotification } = useNotificationContext();

  const loginFormSchema = yup.object({
    email: yup.string().email("Please enter a valid email").required("Please enter your email"),
    password: yup.string().required("Please enter your password"),
  });

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  const login = handleSubmit(async (values) => {
    setLoading(true);
    console.log("🔐 Starting login process...", { email: values.email });
    
    try {
      // 1. Make API call to login
      const response = await httpClient.post("/api/users/login", values);
      console.log("✅ Login API response:", response.data);

      const responseData = response.data;

      // 2. Check if login was successful
      if (responseData.success && responseData.data) {
        console.log("🎉 Login successful!");
        
        // 3. Prepare session data
        const sessionData = {
          token: responseData.data.accessToken,
          refreshToken: responseData.data.refreshToken,
          user: responseData.data.user
        };

        console.log("📦 Session data to save:", sessionData);

        // 4. Save session
        const saveSuccess = saveSession(sessionData);
        
        if (saveSuccess) {
          // 5. Show success message
          showNotification({
            message: `Welcome back, ${responseData.data.user.name}!`,
            variant: "success",
          });

          // 6. Redirect user
          const redirectTo = searchParams.get("redirectTo") || "/dashboard/analytics";
          console.log("🔄 Redirecting to:", redirectTo);
          
          setTimeout(() => {
            navigate(redirectTo, { replace: true });
          }, 500);
        } else {
          throw new Error("Failed to save session");
        }
      } else {
        // Login failed on server
        showNotification({
          message: responseData.error || "Login failed",
          variant: "danger",
        });
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      
      let errorMessage = "Login failed. Please try again.";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showNotification({
        message: errorMessage,
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  });

  return { loading, login, control };
};

export default useSignIn;