import { useState, useEffect } from "react";

import StellarService from "../../utils/StellarService";

import WalletConnectClient, { CLIENT_EVENTS } from "@walletconnect/client";

import Button from "react-bootstrap/Button";

import QRCode from "qrcode.react";

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

  // Walletconnect
  const [wc, setWc] = useState(false);
  // Secret key
  const [pk, setPk] = useState(false);

  const [client, setClient] = useState(null);
  const [uri, setUri] = useState("");
  const [session, setSession] = useState(null);
  const [isPairCreated, setIsPairCreated] = useState(false);

  const [sessionProposal, setSessionProposal] = useState(false);
  const [sessionCreated, setSessionCreated] = useState(false);

  const [walletConnectQRCodeModal, setWalletConnectQRCodeModal] =
    useState(false);
  const [
    walletConnectSessionRequestModal,
    setWalletConnectSessionRequestModal,
  ] = useState(false);

  const toggleLoginModal = async () => {
    await walletConnectInit();
    setShowLoginModal(!showLoginModal);
  };
  const toggleSecretKeyModal = () => setShowSecretKeyModal(!showSecretKeyModal);

  const toggleQRCodeModal = async () => {
    setWalletConnectQRCodeModal(!walletConnectQRCodeModal);
  };

  const toggleSessionRequestModal = async () => {
    setWalletConnectSessionRequestModal(!walletConnectSessionRequestModal);
  };

  const TESTNET = "stellar:testnet";
  const PUBNET = "stellar:pubnet";
  const STELLAR_METHODS = {
    SIGN: "stellar_signAndSubmitXDR",
    // SIGN: "stellar_signXDR",
  };

  const walletConnectInit = async () => {
    const clientInit = await WalletConnectClient.init({
      logger: "debug",
      projectId: "your project id here",
      relayUrl: "wss://relay.walletconnect.org",
      metadata: {
        name: "Stellar Testing",
        description: "Stellar Testing",
        url: "change here",
        icons: [
          "https://avatars.githubusercontent.com/u/25021964?s=200&v=4.png",
        ],
      },
    });

    setClient(clientInit);
  };

  const connect = async () => {
    client.on(CLIENT_EVENTS.pairing.proposal, async (proposal) => {
      // uri should be shared with the Wallet either through QR Code scanning or mobile deep linking
      const { uri } = proposal.signal.params;
      setUri(uri);
      toggleQRCodeModal();
    });

    client.on(CLIENT_EVENTS.pairing.created, async (proposal) => {
      if (typeof client === "undefined") return;
      setIsPairCreated(true);
    });

    client.on(CLIENT_EVENTS.session.proposal, async (proposal) => {
      if (typeof client === "undefined") return;
      setSessionProposal(true);
      setWalletConnectQRCodeModal(false);
      toggleSessionRequestModal();
    });

    client.on(CLIENT_EVENTS.session.created, async (proposal) => {
      if (typeof client === "undefined") return;
      setSessionCreated(true);
      setWc(true);
      toggleSessionRequestModal();
      toggleLoginModal();
      const [chain, reference, publicKey] =
        client.session.values[0].state.accounts[0].split(":");
      setPublicKey(publicKey);
      setAuthenticated(true);
    });

    try {
      const session = await client.connect({
        permissions: {
          blockchain: {
            chains: [PUBNET],
          },
          jsonrpc: {
            methods: [STELLAR_METHODS.SIGN],
          },
        },
      });
      setSession(session);
    } catch (error) {
      console.log(error);
    }
  };

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
        setPk(true);
        setAuthenticated(true);
      }
    } catch (error) {
      console.log(error);
      setResponse("Invalid secret key.");
    }
  };

  const logout = async () => {
    setAuthenticated(false);
    if (wc) {
      if (session) {
        await client.disconnect({
          topic: session.topic,
          reason: "log out",
        });
      }
      setSession(null);
      setClient(null);
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
          <Button variant="secondary" onClick={logout}>
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
          connect={connect}
          walletConnectQRCodeModal={walletConnectQRCodeModal}
          walletConnectSessionRequestModal={walletConnectSessionRequestModal}
          toggleQRCodeModal={toggleQRCodeModal}
          QRCode={QRCode}
          uri={uri}
          toggleSessionRequestModal={toggleSessionRequestModal}
        />
      )}
    </div>
  );
};

export default Login;
