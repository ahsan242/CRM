import { Button } from "react-bootstrap";
import PasswordFormInput from "@/components/form/PasswordFormInput";
import TextFormInput from "@/components/form/TextFormInput";
import useSignUp from "@/http/signup"; 
import { signupSchema } from "@/validations/signupSchema"; // only reference, schema lives in validations

const SignupForm = () => {
  const { loading, onSubmit, control, register } = useSignUp();

  return (
    <form onSubmit={onSubmit} className="authentication-form">
      <TextFormInput control={control} name="name" label="Name" placeholder="Enter your full name" />
      <TextFormInput control={control} name="email" label="Email" placeholder="Enter your email" />

      <PasswordFormInput control={control} name="password" label="Password" placeholder="Enter your password" />
      <PasswordFormInput control={control} name="confirmPassword" label="Confirm Password" placeholder="Confirm password" />

      {/* Roles */}
      <div className="mb-3 d-flex gap-2">
        {["admin", "superadmin", "boss", "operator"].map((role) => (
          <div key={role}>
            <input
              type="radio"
              className="btn-check"
              id={`radio-${role}`}
              value={role}
              {...register("role")}
            />
            <label className="btn btn-outline-primary" htmlFor={`radio-${role}`}>
              {role}
            </label>
          </div>
        ))}
      </div>

      <div className="text-center d-grid">
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </Button>
      </div>
    </form>
  );
};

export default SignupForm;
