
// import { Link } from 'react-router-dom';
// import * as yup from 'yup';
// import PasswordFormInput from '@/components/form/PasswordFormInput';
// import TextFormInput from '@/components/form/TextFormInput';
// import { Button } from 'react-bootstrap';
// import useSignIn from './useSignIn';

// export const signupSchema = yup.object({
//   username: yup.string().required('Please enter your user name'),
//   email: yup
//     .string()
//     .email('Please enter a valid email')
//     .required('Please enter your email'),
//   password: yup.string().required('Please enter your password'),
//   confirmPassword: yup
//     .string()
//     .oneOf([yup.ref('password'), null], 'Passwords must match'),
// });

// const SignupForm = () => {
//   const { loading, login, control } = useSignIn();

//   return (
//     <form onSubmit={login} className="authentication-form">
//       <TextFormInput
//         control={control}
//         name="username"
//         containerClassName="mb-3"
//         label="User Name"
//         id="user-name"
//         placeholder="Enter user name"
//       />
//       <TextFormInput
//         control={control}
//         name="email"
//         containerClassName="mb-3"
//         label="Email"
//         id="email-id"
//         placeholder="Enter your email"
//       />

//       <PasswordFormInput
//         control={control}
//         name="password"
//         containerClassName="mb-3"
//         placeholder="Enter your password"
//         id="password-id"
//         label={
//           <>
//             <label className="form-label" htmlFor="example-password">
//               Password
//             </label>
//           </>
//         }
//       />

//       <PasswordFormInput
//         control={control}
//         name="confirmPassword"
//         containerClassName="mb-3"
//         placeholder="Confirm password"
//         id="confirm-password"
//         label={
//           <>
//             <label className="form-label" htmlFor="confirm-password">
//               Confirm Password
//             </label>
//           </>
//         }
//       />

//       <div className="mb-3 d-flex gap-2">
//         <input
//           type="radio"
//           className="btn-check"
//           name="role"
//           id="radio-admin"
//           autoComplete="off"
//         />
//         <label className="btn btn-outline-primary" htmlFor="radio-admin">
//           Admin
//         </label>

//         <input
//           type="radio"
//           className="btn-check"
//           name="role"
//           id="radio-super-admin"
//           autoComplete="off"
//         />
//         <label className="btn btn-outline-primary" htmlFor="radio-super-admin">
//           Super Admin
//         </label>

//         <input
//           type="radio"
//           className="btn-check"
//           name="role"
//           id="radio-boss"
//           autoComplete="off"
//         />
//         <label className="btn btn-outline-primary" htmlFor="radio-boss">
//           Boss
//         </label>

//         <input
//           type="radio"
//           className="btn-check"
//           name="role"
//           id="radio-operator"
//           autoComplete="off"
//         />
//         <label className="btn btn-outline-primary" htmlFor="radio-operator">
//           Operator
//         </label>
//       </div>

//       <div className="mb-1 text-center d-grid">
//         <Button variant="primary" type="submit" disabled={loading}>
//           Sign Up
//         </Button>
//       </div>
//     </form>
//   );
// };

// export default SignupForm;


// src/pages/auth/SignupForm.jsx
import { Button } from "react-bootstrap";
import * as yup from "yup";
import PasswordFormInput from "@/components/form/PasswordFormInput";
import TextFormInput from "@/components/form/TextFormInput";
import useSignUp from "@/http/signup"; // ✅ correct hook

export const signupSchema = yup.object({
  username: yup.string().required("Please enter your user name"),
  email: yup.string().email("Please enter a valid email").required("Please enter your email"),
  password: yup.string().required("Please enter your password"),
  confirmPassword: yup.string().oneOf([yup.ref("password"), null], "Passwords must match"),
  role: yup.string().required("Please select a role"),
});

const SignupForm = () => {
  const { loading, register, control } = useSignUp(); // ✅ use signup hook

  return (
    <form onSubmit={register} className="authentication-form">
      <TextFormInput control={control} name="username" label="User Name" placeholder="Enter user name" />
      <TextFormInput control={control} name="email" label="Email" placeholder="Enter your email" />

      <PasswordFormInput control={control} name="password" label="Password" placeholder="Enter your password" />
      <PasswordFormInput control={control} name="confirmPassword" label="Confirm Password" placeholder="Confirm password" />

      {/* Roles */}
      <div className="mb-3 d-flex gap-2">
        {["Admin", "Super Admin", "Boss", "Operator"].map((role) => (
          <div key={role}>
            <input type="radio" className="btn-check" name="role" id={`radio-${role}`} value={role} {...control.register("role")} />
            <label className="btn btn-outline-primary" htmlFor={`radio-${role}`}>
              {role}
            </label>
          </div>
        ))}
      </div>

      <div className="text-center d-grid">
        <Button variant="primary" type="submit" disabled={loading}>
          Sign Up
        </Button>
      </div>
    </form>
  );
};

export default SignupForm;
