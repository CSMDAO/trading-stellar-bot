import { useState } from "react";

import StellarService from "../../utils/StellarService";

import Button from "react-bootstrap/Button";

import LoginModal from "./LoginModal";

const Login = ({
  authenticated,
  setAuthenticated,
  secretKey,
  setSecretKey,
}) => {
  const Stellar = new StellarService();

  const [publicKey, setPublicKey] = useState("");

  const [response, setResponse] = useState("");

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSecretKeyModal, setShowSecretKeyModal] = useState(false);

  const toggleLoginModal = () => setShowLoginModal(!showLoginModal);
  const toggleSecretKeyModal = () => setShowSecretKeyModal(!showSecretKeyModal);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (
        !secretKey.startsWith("S") ||
        !(secretKey === secretKey.toUpperCase())
      ) {
        setResponse(
          'Invalid secret key. Secret keys are uppercase and begin with the letter "S".'
        );
      } else {
        const data = await Stellar.login(secretKey);
        setShowSecretKeyModal(false);
        setShowLoginModal(false);
        setPublicKey(data);
        setAuthenticated(true);
      }
    } catch (error) {
      console.log(error);
      setResponse("Invalid secret key.");
    }
  };

  const validate = () => {
    return secretKey.length > 0;
  };

  return (
    <div className="login">
      {!authenticated ? (
        <div className="loginButton">
          <Button variant="secondary" onClick={toggleLoginModal}>
            Login
          </Button>
        </div>
      ) : (
        <div className="loginButton">
          <Button variant="secondary" onClick={() => setAuthenticated(false)}>
            Logout
          </Button>
          <p>Logged in, Public Key: {publicKey}</p>
        </div>
      )}
      {showLoginModal && (
        <LoginModal
          showLoginModal={showLoginModal}
          toggleLoginModal={toggleLoginModal}
          showSecretKeyModal={showSecretKeyModal}
          toggleSecretKeyModal={toggleSecretKeyModal}
          secretKey={secretKey}
          setSecretKey={setSecretKey}
          handleSubmit={handleSubmit}
          validate={validate}
          response={response}
        />
      )}
    </div>
  );
};

export default Login;
