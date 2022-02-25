import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Alert from "react-bootstrap/Alert";

const CreateAccountModal = ({
  showCreateAccountModal,
  toggleCreateAccountModal,
  amount,
  setAmount,
  createAccount,
  response,
}) => {
  return (
    <div className="create-account-modal">
      <Modal
        size="lg"
        show={showCreateAccountModal}
        onHide={toggleCreateAccountModal}
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="amount">
              <Form.Label>Amount to send (XLM)</Form.Label>
              <Form.Control
                type="text"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                }}
                placeholder="Enter amount"
              />
            </Form.Group>

            <div className="d-grid gap-2">
              <Button variant="secondary" size="lg" onClick={createAccount}>
                Create Account
              </Button>
            </div>
          </Form>
          <br />
          {response && <Alert variant="secondary">{response}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={toggleCreateAccountModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CreateAccountModal;
