import { useState } from 'react';
import { Card, CardBody, Col, Row, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import LogoBox from '@/components/LogoBox';
import PageMetaData from '@/components/PageTitle';
import ThirdPartyAuth from '@/components/ThirdPartyAuth';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import signInImg from '@/assets/images/sign-in.svg';

const SignIn = () => {
  const [isSignup, setIsSignup] = useState(false);

  return (
    <>
      <PageMetaData title={isSignup ? 'Sign Up' : 'Sign In S'} />

      <Card className="auth-card">
        <CardBody className="p-0">
          <Row className="align-items-center g-0">
            <Col lg={6} className="d-none d-lg-inline-block border-end">
              <div className="auth-page-sidebar">
                <img
                  src={signInImg}
                  width={521}
                  height={521}
                  alt="auth"
                  className="img-fluid"
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="p-4">
                <div className="mx-auto mb-4 text-center auth-logo">
                  <LogoBox
                    textLogo={{ height: 24, width: 73 }}
                    squareLogo={{ className: 'me-1' }}
                    containerClassName="mx-auto mb-4 text-center auth-logo"
                  />
                </div>

                <h2 className="fw-bold text-center fs-18">
                  {isSignup ? 'Sign Up' : 'Sign In'}
                </h2>
                <p className="text-muted text-center mt-1 mb-4">
                  {isSignup
                    ? 'Create your account to access admin panel.'
                    : 'To access admin panel !'}
                </p>

                <Row className="justify-content-center">
                  <Col xs={12} md={8}>
                    {isSignup ? <SignupForm /> : <LoginForm />}
                    <ThirdPartyAuth />
                  </Col>
                </Row>

                {/* Toggle between Sign In / Sign Up */}
                <div className="text-center mt-3">
                  {isSignup ? (
                    <p className="mb-0">
                      Already have an account?
                      <Button
                        variant="link"
                        className="fw-bold ms-1 p-0"
                        onClick={() => setIsSignup(false)}
                      >
                        Sign In
                      </Button>
                    </p>
                  ) : (
                    <p className="mb-0">
                      Don&apos;t have an account?
                      <Button
                        variant="link"
                        className="fw-bold ms-1 p-0"
                        onClick={() => setIsSignup(true)}
                      >
                        Sign Up
                      </Button>
                    </p>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </>
  );
};

export default SignIn;
