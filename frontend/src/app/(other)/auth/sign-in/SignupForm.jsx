
import { Button } from "react-bootstrap";
import PasswordFormInput from "@/components/form/PasswordFormInput";
import TextFormInput from "@/components/form/TextFormInput";
import useSignUp from "@/http/signup"; 
import EmailVerificationModal from "@/components/EmailVerificationModal";
import { useState, useEffect } from "react";

const SignupForm = () => {
  const { 
    loading, 
    onSubmit, 
    control, 
    register, 
    verificationData,
    setVerificationData,
    onVerificationComplete 
  } = useSignUp();

  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Automatically show verification modal when verification data is received
  useEffect(() => {
    if (verificationData) {
      setShowVerificationModal(true);
    }
  }, [verificationData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  const handleVerificationComplete = (data) => {
    onVerificationComplete(data);
    setShowVerificationModal(false);
    setVerificationData(null);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="authentication-form">
        <TextFormInput 
          control={control} 
          name="name" 
          label="Full Name" 
          placeholder="Enter your full name" 
        />
        
        <TextFormInput 
          control={control} 
          name="email" 
          label="Email Address" 
          placeholder="Enter your email" 
        />

        <PasswordFormInput 
          control={control} 
          name="password" 
          label="Password" 
          placeholder="Enter your password" 
        />
        
        <PasswordFormInput 
          control={control} 
          name="confirmPassword" 
          label="Confirm Password" 
          placeholder="Confirm your password" 
        />

        {/* Role Selection */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Account Type</label>
          <div className="d-flex gap-2 flex-wrap">
            {["customer", "operator", "admin"].map((role) => (
              <div key={role}>
                <input
                  type="radio"
                  className="btn-check"
                  id={`radio-${role}`}
                  value={role}
                  {...register("role")}
                />
                <label 
                  className={`btn btn-outline-primary text-capitalize ${
                    control._formValues.role === role ? 'active' : ''
                  }`} 
                  htmlFor={`radio-${role}`}
                >
                  {role}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center d-grid">
          <Button 
            variant="primary" 
            type="submit" 
            disabled={loading}
            className="fw-semibold"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </div>

        <div className="mt-3">
          <p className="text-muted small text-center">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
            You'll receive a verification code via email to activate your account.
          </p>
        </div>
      </form>

      {/* Email Verification Modal - Shows automatically when verification data exists */}
      <EmailVerificationModal
        show={showVerificationModal}
        onHide={() => {
          setShowVerificationModal(false);
          setVerificationData(null);
        }}
        email={verificationData?.email}
        verificationToken={verificationData?.verificationToken}
        onVerificationComplete={handleVerificationComplete}
      />
    </>
  );
};

export default SignupForm;