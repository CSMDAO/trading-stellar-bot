import { useEffect, useState } from "react";

import Login from "../components/Login/Login";
import CreateAccount from "../components/CreateAccount/CreateAccount";
import DexOffers from "../components/Offers/DexOffers";

import Container from "react-bootstrap/Container";
import Alert from "react-bootstrap/Alert";

const Home = () => {
  const [authenticated, setAuthenticated] = useState(false);

  const [secretKey, setSecretKey] = useState("");

  const [response, setResponse] = useState("");

  useEffect(() => {
    if (authenticated) {
      setResponse("");
    }
  }, [authenticated]);

  return (
    <Container>
      <div className="main-div">
        <Login
          authenticated={authenticated}
          setAuthenticated={setAuthenticated}
          secretKey={secretKey}
          setSecretKey={setSecretKey}
        />

        <DexOffers
          authenticated={authenticated}
          secretKey={secretKey}
          setAuthResponse={setResponse}
        />

        <CreateAccount
          authenticated={authenticated}
          secretKey={secretKey}
          setAuthResponse={setResponse}
        />
      </div>

      <br />

      {response && <Alert variant="secondary">{response}</Alert>}
    </Container>
  );
};

export default Home;
