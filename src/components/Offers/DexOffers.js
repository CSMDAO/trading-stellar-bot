import { useEffect, useState } from "react";
import StellarService from "../../utils/StellarService";

import Button from "react-bootstrap/Button";

import DexOffersModal from "./DexOffersModal";

const DexOffers = ({ authenticated, secretKey, setAuthResponse }) => {
  const Stellar = new StellarService();

  const [buyResponse, setBuyResponse] = useState([]);
  const [sellResponse, setSellResponse] = useState([]);

  const [amount, setAmount] = useState("");

  const [marketPrice, setMarketPrice] = useState("");

  const [buyingPrice, setBuyingPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");

  const [balanceBNB, setBalanceBNB] = useState("");
  const [balanceUSDC, setBalanceUSDC] = useState("");

  // const [resInterval, setResInterval] = useState(null);

  const [showOffersModal, setShowOffersModal] = useState(false);

  // const toggleOffersModal = () => setShowOffersModal(!showOffersModal);

  const handleCloseOffersModal = () => setShowOffersModal(false);
  const handleShowOffersModal = () => {
    setShowOffersModal(true);
    getBalanceBNB();
    getBalanceUSDC();
  };

  useEffect(() => {
    async function latest() {
      const getMarketPrice = await Stellar.getBNBUSDTpair();
      setMarketPrice(getMarketPrice);

      const getBuyingPrice = await Stellar.getBNBUSDTpair("lower");
      setBuyingPrice(getBuyingPrice);

      const getSellingPrice = await Stellar.getBNBUSDTpair("higher");
      setSellingPrice(getSellingPrice);
    }
    latest();
    const interval = setInterval(() => latest(), 30000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const getBalanceBNB = async () => {
    try {
      const data = await Stellar.getBalance(secretKey, "BNB");
      setBalanceBNB(data);
      return data;
    } catch (e) {
      console.log(e);
    }
  };

  const getBalanceUSDC = async () => {
    try {
      const data = await Stellar.getBalance(secretKey, "USDC");
      setBalanceUSDC(data);
      return data;
    } catch (e) {
      console.log(e);
    }
  };

  const getBuyingTotal = () => {
    return Number(buyingPrice * Number(amount)).toFixed(2);
  };

  const getSellingTotal = () => {
    return Number(sellingPrice * Number(amount)).toFixed(2);
  };

  const validate = () => {
    return amount.length > 0;
  };

  const buy = async (e) => {
    e.preventDefault();
    try {
      const data = await Stellar.buyOffer(secretKey, amount);
      const buyRes = await Stellar.buyResponse();
      setBuyResponse((buyResponse) => [...buyResponse, buyRes]);
      setInterval(async () => {
        const res = await Stellar.buyResponse();
        setBuyResponse((buyResponse) =>
          [...buyResponse].map((el) =>
            el.id === res.id ? { ...el, response: res.response } : el
          )
        );
      }, 30000);
      return data;
    } catch (e) {
      console.log(e);
    }
  };

  const sell = async (e) => {
    e.preventDefault();
    try {
      const data = await Stellar.sellOffer(secretKey, amount);
      const sellRes = await Stellar.sellResponse();
      setSellResponse((sellResponse) => [...sellResponse, sellRes]);
      setInterval(async () => {
        const res = await Stellar.sellResponse();
        setSellResponse((sellResponse) =>
          [...sellResponse].map((el) =>
            el.id === res.id ? { ...el, response: res.response } : el
          )
        );
      }, 30000);
      return data;
    } catch (e) {
      console.log(e);
    }
  };

  // const cancelBuyOffer = async (id) => {
  //   try {
  //     const data = await Stellar.buyOffer(secretKey, amount, id);
  //     return data;
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };

  // const cancelSellOffer = async (id) => {
  //   try {
  //     const data = await Stellar.sellOffer(secretKey, amount, id);
  //     return data;
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };

  return (
    <div className="trade-sdex">
      <div className="trade-sdex-button">
        <Button
          variant="secondary"
          onClick={() =>
            authenticated
              ? handleShowOffersModal()
              : setAuthResponse("Not authenticated")
          }
        >
          Trade
        </Button>
      </div>

      {showOffersModal && (
        <DexOffersModal
          showOffersModal={showOffersModal}
          handleCloseOffersModal={handleCloseOffersModal}
          buyResponse={buyResponse}
          sellResponse={sellResponse}
          amount={amount}
          setAmount={setAmount}
          validate={validate}
          buy={buy}
          // cancelBuyOffer={cancelBuyOffer}
          sell={sell}
          // cancelSellOffer={cancelSellOffer}
          marketPrice={marketPrice}
          buyingPrice={buyingPrice}
          sellingPrice={sellingPrice}
          getBuyingTotal={getBuyingTotal}
          getSellingTotal={getSellingTotal}
          balanceBNB={balanceBNB}
          balanceUSDC={balanceUSDC}
        />
      )}
    </div>
  );
};

export default DexOffers;
