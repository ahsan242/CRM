
import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { useVerification } from '@/http/useVerification';

const EmailVerificationModal = ({ 
  show, 
  onHide, 
  email, 
  verificationToken,
  onVerificationComplete 
}) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(15 * 60); // 15 minutes in seconds
  const { verifyEmail, resendVerification } = useVerification();

  useEffect(() => {
    if (show && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [show, timer]);

  useEffect(() => {
    if (show) {
      setTimer(15 * 60);
      setCode(['', '', '', '', '', '']);
    }
  }, [show]);

  const handleCodeChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`verification-code-${index + 1}`);
        if (nextInput) nextInput.focus();
      }

      // Auto-submit when all digits are entered
      if (newCode.every(digit => digit !== '') && index === 5) {
        handleVerify();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`verification-code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      alert('Please enter the complete 6-digit code');
      return;
    }

    try {
      const result = await verifyEmail.mutateAsync({
        email,
        verificationCode,
        verificationToken
      });

      if (result.success) {
        onVerificationComplete(result.data);
      }
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleResendCode = () => {
    resendVerification.mutate(email);
    setTimer(15 * 60);
    setCode(['', '', '', '', '', '']);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" keyboard={false}>
      <Modal.Header closeButton={!verifyEmail.isPending}>
        <Modal.Title>Verify Your Email</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {verifyEmail.isPending ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p>Verifying your email...</p>
          </div>
        ) : (
          <>
            <Alert variant="info" className="mb-4">
              <p className="mb-2">
                We've sent a 6-digit verification code to:
              </p>
              <strong>{email}</strong>
              <p className="mb-0 mt-2">
                Please check your inbox and enter the code below.
              </p>
            </Alert>

            <Form>
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Verification Code</Form.Label>
                <Row className="g-2 justify-content-center">
                  {code.map((digit, index) => (
                    <Col xs={2} key={index}>
                      <Form.Control
                        id={`verification-code-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="text-center fw-bold fs-5"
                        disabled={verifyEmail.isPending || timer === 0}
                        autoFocus={index === 0}
                      />
                    </Col>
                  ))}
                </Row>
              </Form.Group>

              <div className="text-center mb-3">
                <p className="text-muted mb-2">
                  Code expires in: <strong>{formatTime(timer)}</strong>
                </p>
                
                {timer === 0 && (
                  <Alert variant="warning" className="py-2">
                    Code expired. Please request a new one.
                  </Alert>
                )}
              </div>
            </Form>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="outline-secondary"
          onClick={onHide}
          disabled={verifyEmail.isPending}
        >
          Cancel
        </Button>
        
        <Button
          variant="outline-primary"
          onClick={handleResendCode}
          disabled={timer > 0 || resendVerification.isPending || verifyEmail.isPending}
        >
          {resendVerification.isPending ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Sending...
            </>
          ) : (
            'Resend Code'
          )}
        </Button>
        
        <Button
          variant="primary"
          onClick={handleVerify}
          disabled={code.join('').length !== 6 || verifyEmail.isPending || timer === 0}
        >
          {verifyEmail.isPending ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Verifying...
            </>
          ) : (
            'Verify Email'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EmailVerificationModal;