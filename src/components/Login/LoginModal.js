import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Alert from "react-bootstrap/Alert";

const LoginModal = ({
  showLoginModal,
  toggleLoginModal,
  showSecretKeyModal,
  toggleSecretKeyModal,
  secretKey,
  setSecretKey,
  handleSubmit,
  validate,
  response,
  connect,
  walletConnectQRCodeModal,
  walletConnectSessionRequestModal,
  toggleQRCodeModal,
  toggleSessionRequestModal,
  QRCode,
  uri,
}) => {
  return (
    <div className="login-modal">
      <Modal show={showLoginModal} onHide={toggleLoginModal}>
        <Modal.Header closeButton>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Login with Secret Key
          <br />
          <br />
          <div className="d-grid gap-2">
            <Button
              variant="secondary"
              size="lg"
              onClick={toggleSecretKeyModal}
            >
              Secret Key
            </Button>
            <Button variant="secondary" size="lg" onClick={connect}>
              WalletConnect
            </Button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={toggleLoginModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showSecretKeyModal} onHide={toggleSecretKeyModal}>
        <Modal.Header closeButton>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form autoComplete="off">
            <Form.Group className="mb-3" controlId="pubkeysendfrom">
              <Form.Label>Secret Key</Form.Label>
              <Form.Control
                type="text"
                value={secretKey}
                onChange={(e) => {
                  setSecretKey(e.target.value);
                }}
                placeholder="Enter secret key"
              />
              <Form.Text className="text-muted">
                Fill out the input to login.
              </Form.Text>
            </Form.Group>

            <Button
              variant="secondary"
              onClick={handleSubmit}
              type="submit"
              disabled={!validate()}
            >
              Login
            </Button>
          </Form>
          <br />
          {response && <Alert variant="secondary">{response}</Alert>}
          <br />
          <br />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={toggleSecretKeyModal}>
            Go back
          </Button>
        </Modal.Footer>
      </Modal>

      {/* QRCode Modal */}
      <Modal show={walletConnectQRCodeModal} onHide={toggleQRCodeModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            Scan QR code with a WalletConnect-compatible wallet
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Open your WalletConnect-compatible app with Stellar support, like
          LOBSTR wallet, and scan the QR code to connect.
          <br />
          <br />
          <div className="text-center">
            <QRCode value={uri} size={300} renderAs="svg" />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={toggleQRCodeModal}>
            Go back
          </Button>
        </Modal.Footer>
      </Modal>

      {/* SessionRequest Modal */}
      <Modal
        show={walletConnectSessionRequestModal}
        onHide={toggleSessionRequestModal}
      >
        <Modal.Header closeButton>
          <Modal.Title>Connecting to LOBSTR with WalletConnect</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          The connection request was sent to LOBSTR. Confirm the request in the
          app and continue.
          <br />
          <br />
          <br />
          Connecting...
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={toggleSessionRequestModal}>
            Go back
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LoginModal;
