import { useState } from "react";

import StellarService from "../../utils/StellarService";

import CreateAccountModal from "./CreateAccountModal";

import Button from "react-bootstrap/Button";

const CreateAccount = ({ authenticated, secretKey, setAuthResponse }) => {
  const Stellar = new StellarService();

  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);

  const [amount, setAmount] = useState("");
  const [response, setResponse] = useState("");

  const toggleCreateAccountModal = () =>
    setShowCreateAccountModal(!showCreateAccountModal);

  const createAccount = async (e) => {
    e.preventDefault();
    try {
      setResponse("Waiting for network...");
      const data = await Stellar.createAccount(secretKey, amount);
      setResponse(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="create-account">
      <div className="create-account-button">
        <Button
          variant="secondary"
          onClick={() =>
            authenticated
              ? toggleCreateAccountModal()
              : setAuthResponse("Not authenticated")
          }
        >
          Create Account
        </Button>
      </div>
      {showCreateAccountModal && (
        <CreateAccountModal
          showCreateAccountModal={showCreateAccountModal}
          toggleCreateAccountModal={toggleCreateAccountModal}
          amount={amount}
          setAmount={setAmount}
          createAccount={createAccount}
          response={response}
        />
      )}
    </div>
  );
};

export default CreateAccount;
