import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Tab from "react-bootstrap/Tab";
import Nav from "react-bootstrap/Nav";
import Alert from "react-bootstrap/Alert";

const DexOffersModal = ({
  showOffersModal,
  handleCloseOffersModal,
  buyResponse,
  // cancelBuyOffer,
  sellResponse,
  // cancelSellOffer,
  amount,
  setAmount,
  validate,
  buy,
  sell,
  marketPrice,
  buyingPrice,
  sellingPrice,
  getBuyingTotal,
  getSellingTotal,
  balanceBNB,
  balanceUSDC,
}) => {
  return (
    <div className="dexoffers-modal">
      <Modal show={showOffersModal} onHide={handleCloseOffersModal}>
        <Modal.Header closeButton>
          <Modal.Title>Trade on SDEX</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5 className="trade-modal-header"> Trade BNB/USDC </h5>
          <Tab.Container defaultActiveKey={1} id="sdextabs" className="mb-3">
            <Nav variant="pills">
              <Nav.Item>
                <Nav.Link eventKey={1}>Buy</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey={2}>Sell</Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey={1} title="Buy">
                <div className="buy-pane">
                  <br />

                  <p> Market Price: {marketPrice} USDC </p>

                  <Form>
                    <Form.Group className="mb-3" controlId="price-textbox">
                      <Form.Control
                        type="text"
                        value={`Buying Price: ${buyingPrice} USDC`}
                        readOnly
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="amount-textbox">
                      <Form.Control
                        type="text"
                        value={amount}
                        onChange={(e) => {
                          setAmount(e.target.value);
                        }}
                        placeholder="Amount (BNB): "
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="total-textbox">
                      <Form.Control
                        type="text"
                        value={`Total: ${getBuyingTotal()} USDC`}
                        readOnly
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="balance">
                      <Form.Text className="text-muted">
                        Your balance: {balanceUSDC} USDC
                      </Form.Text>
                    </Form.Group>

                    <div className="d-grid gap-2">
                      <Button
                        variant="secondary"
                        size="lg"
                        onClick={buy}
                        type="submit"
                        disabled={!validate()}
                      >
                        Buy BNB
                      </Button>
                    </div>
                    <Form.Group className="mb-3" controlId="closebtn">
                      <Form.Text className="text-muted">
                        Click the close button below, to cancel an offer.
                      </Form.Text>
                    </Form.Group>
                  </Form>
                  {buyResponse &&
                    buyResponse.map((res, idx) => {
                      return (
                        <div key={idx}>
                          {/* {!res.filled ? (
                            <Alert
                              variant="secondary"
                              onClick={cancelBuyOffer(res.offerId)}
                              dismissible
                            >
                              {res.response}
                            </Alert>
                          ) : ( */}
                          <Alert variant="secondary">{res.response}</Alert>
                          {/* )} */}
                        </div>
                      );
                    })}
                  {sellResponse &&
                    sellResponse.map((res, idx) => {
                      return (
                        <div key={idx}>
                          {/* {!res.filled ? (
                            <Alert
                              variant="secondary"
                              onClick={cancelSellOffer(res.offerId)}
                              dismissible
                            >
                              {res.response}
                            </Alert>
                          ) : ( */}
                          <Alert variant="secondary">{res.response}</Alert>
                          {/* )} */}
                        </div>
                      );
                    })}
                </div>
              </Tab.Pane>
              <Tab.Pane eventKey={2} title="Sell">
                <div className="sell-pane">
                  <br />

                  <p> Market Price: {marketPrice} USDC </p>

                  <Form>
                    <Form.Group className="mb-3" controlId="price-textbox">
                      <Form.Control
                        type="text"
                        value={`Selling Price: ${sellingPrice} USDC`}
                        readOnly
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="amount-textbox">
                      <Form.Control
                        type="text"
                        value={amount}
                        onChange={(e) => {
                          setAmount(e.target.value);
                        }}
                        placeholder="Amount (BNB): "
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="total-textbox">
                      <Form.Control
                        type="text"
                        value={`Total: ${getSellingTotal()} USDC`}
                        readOnly
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="balance">
                      <Form.Text className="text-muted">
                        Your balance: {balanceBNB} BNB
                      </Form.Text>
                    </Form.Group>

                    <div className="d-grid gap-2">
                      <Button
                        variant="secondary"
                        size="lg"
                        onClick={sell}
                        type="submit"
                        disabled={!validate()}
                      >
                        Sell BNB
                      </Button>
                    </div>

                    <Form.Group className="mb-3" controlId="closebtn">
                      <Form.Text className="text-muted">
                        Click the close button below, to cancel an offer.
                      </Form.Text>
                    </Form.Group>
                  </Form>
                  {buyResponse &&
                    buyResponse.map((res, idx) => {
                      return (
                        <div key={idx}>
                          {/* {!res.filled ? (
                            <Alert
                              variant="secondary"
                              onClick={cancelBuyOffer(res.offerId)}
                              dismissible
                            >
                              {res.response}
                            </Alert>
                          ) : ( */}
                          <Alert variant="secondary">{res.response}</Alert>
                          {/* )} */}
                        </div>
                      );
                    })}
                  {sellResponse &&
                    sellResponse.map((res, idx) => {
                      return (
                        <div key={idx}>
                          {/* {!res.filled ? (
                            <Alert
                              variant="secondary"
                              onClick={cancelSellOffer(res.offerId)}
                              dismissible
                            >
                              {res.response}
                            </Alert>
                          ) : ( */}
                          <Alert variant="secondary">{res.response}</Alert>
                          {/* )} */}
                        </div>
                      );
                    })}
                </div>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseOffersModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DexOffersModal;
