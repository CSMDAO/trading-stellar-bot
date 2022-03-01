import * as StellarSdk from "stellar-sdk";
import Binance from "binance-api-node";

export default class StellarService {
  pair = StellarSdk.Keypair.random();
  client = Binance();

  constructor() {
    this.buyRes = null;
    this.sellRes = null;
    this.spread = [0.5, 0.75, 1, 1.25, 1.5];
    this.i = 0;
  }

  async login(secretKey) {
    let account = StellarSdk.Keypair.fromSecret(secretKey);
    return account.publicKey();
  }

  async streamOp(secretKey) {
    var server = new StellarSdk.Server("https://horizon.stellar.org");

    var callback = function (resp) {
      console.log(resp);
    };

    let acc = StellarSdk.Keypair.fromSecret(secretKey);

    server
      .operations()
      .forAccount(acc.publicKey())
      .cursor("now")
      .stream({ onmessage: callback });
  }

  async getBalance(secretKey, type) {
    let account = StellarSdk.Keypair.fromSecret(secretKey);

    let horizon = new StellarSdk.Server("https://horizon.stellar.org");

    let sourceAccount = await horizon.loadAccount(account.publicKey());

    if (type === "BNB") {
      return Number.parseFloat(
        sourceAccount.balances.find((b) => b.asset_code === "BNB").balance
      );
    } else if (type === "USDC") {
      return Number.parseFloat(
        sourceAccount.balances.find((b) => b.asset_code === "USDC").balance
      );
    }
  }

  async createAccount(sourceSecretKey, amount) {
    let source = StellarSdk.Keypair.fromSecret(sourceSecretKey);
    let dest = StellarSdk.Keypair.fromSecret(this.pair.secret());

    let horizon = new StellarSdk.Server("https://horizon.stellar.org");

    let sourceAccount = await horizon.loadAccount(source.publicKey());

    let builder = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: "100000",
    });

    builder.addOperation(
      StellarSdk.Operation.createAccount({
        destination: dest.publicKey(),
        startingBalance: amount,
      })
    );

    builder.setNetworkPassphrase(StellarSdk.Networks.PUBLIC);

    builder.setTimeout(30);

    let tx = builder.build();

    tx.sign(source);

    try {
      const submitTx = await horizon.submitTransaction(tx);
      console.log("Account created!", submitTx);
      return `Account created with Public Key: ${dest.publicKey()}, Secret Key: ${dest.secret()}`;
    } catch (e) {
      console.log(e);
      return "Error creating account, check console for more details";
    }
  }

  async getBNBUSDTpair(type) {
    let getRate = await this.client.prices({ symbol: "BNBUSDT" });

    let lower =
      Number.parseFloat(getRate.BNBUSDT) -
      Number.parseFloat(getRate.BNBUSDT) * ((this.spread[this.i] || 1.5) / 100);

    let higher =
      Number.parseFloat(getRate.BNBUSDT) +
      Number.parseFloat(getRate.BNBUSDT) * ((this.spread[this.i] || 1.5) / 100);

    if (type === "lower") {
      return Number.parseFloat(lower).toFixed(1);
    } else if (type === "higher") {
      return Number.parseFloat(higher).toFixed(1);
    } else {
      return Number.parseFloat(getRate.BNBUSDT);
    }
  }

  async buyResponse() {
    return this.buyRes;
  }

  async sellResponse() {
    return this.sellRes;
  }

  async buyOffer(sourceSecretKey, amount, cancelOfferId) {
    let source = StellarSdk.Keypair.fromSecret(sourceSecretKey);
    let horizon = new StellarSdk.Server("https://horizon.stellar.org");

    let sourceAccount = await horizon.loadAccount(source.publicKey());

    let builder = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: "100000",
    });

    if (cancelOfferId !== undefined) {
      builder.addOperation(
        StellarSdk.Operation.manageBuyOffer({
          selling: new StellarSdk.Asset(
            "USDC",
            "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
          ),
          buying: new StellarSdk.Asset(
            "BNB",
            "GANCHORKQEZ46AFTJLEVTA5MCE432MSR5VMVQBWW3LAUYGTBFTKGKTJF"
          ),
          buyAmount: "0",
          price: await this.getBNBUSDTpair("lower"),
          offerId: cancelOfferId,
        })
      );
    } else {
      builder.addOperation(
        StellarSdk.Operation.manageBuyOffer({
          selling: new StellarSdk.Asset(
            "USDC",
            "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
          ),
          buying: new StellarSdk.Asset(
            "BNB",
            "GANCHORKQEZ46AFTJLEVTA5MCE432MSR5VMVQBWW3LAUYGTBFTKGKTJF"
          ),
          buyAmount: amount,
          price: await this.getBNBUSDTpair("lower"),
        })
      );
    }

    builder.setNetworkPassphrase(StellarSdk.Networks.PUBLIC);

    builder.setTimeout(30);

    let tx = builder.build();
    tx.sign(source);

    try {
      const submitTransaction = await horizon.submitTransaction(tx);
      if (cancelOfferId !== undefined) {
        return;
      }
      const offerRes = submitTransaction.offerResults[0];
      if (offerRes.wasImmediatelyFilled) {
        let offerId = offerRes.offersClaimed[0].offerId;
        let amountBought = offerRes.amountBought;
        let boughtAsset = offerRes.offersClaimed[0].assetSold.assetCode;
        this.buyRes = {
          offerId: offerId,
          filled: true,
          response: `Buy order for ${amountBought} ${boughtAsset}, has just been filled.`,
        };
        console.log("Buy order filled", submitTransaction);
      } else {
        let currentOfferId =
          submitTransaction.offerResults[0].currentOffer.offerId;
        let price =
          submitTransaction.offerResults[0].currentOffer.price.d /
          submitTransaction.offerResults[0].currentOffer.price.n;
        let soldAsset =
          submitTransaction.offerResults[0].currentOffer.selling.assetCode;
        let boughtAsset =
          submitTransaction.offerResults[0].currentOffer.buying.assetCode;
        setInterval(async () => {
          return await this.updateBuyOffer(
            sourceSecretKey,
            amount,
            currentOfferId
          );
        }, 60000);
        this.buyRes = {
          offerId: currentOfferId,
          filled: false,
          response: `Buy offer sent at ${price}, sold ${soldAsset}, bought ${amount} ${boughtAsset}`,
        };
        console.log("Buy Offer successfully sent!", submitTransaction);
      }
    } catch (e) {
      console.log(e);
      return "Error sending transaction, check console for more details";
    }
  }

  async updateBuyOffer(sourceSecretKey, amount, currentOfferId) {
    let source = StellarSdk.Keypair.fromSecret(sourceSecretKey);
    let horizon = new StellarSdk.Server("https://horizon.stellar.org");

    let sourceAccount = await horizon.loadAccount(source.publicKey());

    let builder = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: "100000",
    });

    console.log(this.spread[this.i++]);
    builder.addOperation(
      StellarSdk.Operation.manageBuyOffer({
        selling: new StellarSdk.Asset(
          "USDC",
          "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
        ),
        buying: new StellarSdk.Asset(
          "BNB",
          "GANCHORKQEZ46AFTJLEVTA5MCE432MSR5VMVQBWW3LAUYGTBFTKGKTJF"
        ),
        buyAmount: amount,
        price: await this.getBNBUSDTpair("lower"),
        offerId: currentOfferId,
      })
    );

    builder.setNetworkPassphrase(StellarSdk.Networks.PUBLIC);

    builder.setTimeout(30);

    let tx = builder.build();
    tx.sign(source);

    try {
      const submitTransaction = await horizon.submitTransaction(tx);
      const offerRes = submitTransaction.offerResults[0];
      if (offerRes.wasImmediatelyFilled) {
        let offerId = offerRes.offersClaimed[0].offerId;
        let amountBought = offerRes.amountBought;
        let boughtAsset = offerRes.offersClaimed[0].assetBought.assetCode;
        this.buyRes = {
          offerId: offerId,
          filled: true,
          response: `Buy order for ${amountBought} ${boughtAsset}, has just been filled.`,
        };
        console.log("Buy order filled", submitTransaction);
      } else {
        let currentOfferId =
          submitTransaction.offerResults[0].currentOffer.offerId;
        let price =
          submitTransaction.offerResults[0].currentOffer.price.d /
          submitTransaction.offerResults[0].currentOffer.price.n;
        let soldAsset =
          submitTransaction.offerResults[0].currentOffer.selling.assetCode;
        let boughtAsset =
          submitTransaction.offerResults[0].currentOffer.buying.assetCode;
        this.buyRes = {
          offerId: currentOfferId,
          filled: false,
          response: `Updated Buy offer at ${price}, sold ${soldAsset}, bought ${amount} ${boughtAsset}`,
        };
        console.log("Updated Buy Offer successfully sent!", submitTransaction);
      }
    } catch (e) {
      console.log(e);
      return "Error sending transaction, check console for more details";
    }
  }

  async sellOffer(sourceSecretKey, amount, cancelOfferId) {
    let source = StellarSdk.Keypair.fromSecret(sourceSecretKey);
    let horizon = new StellarSdk.Server("https://horizon.stellar.org");

    let sourceAccount = await horizon.loadAccount(source.publicKey());

    let builder = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: "100000",
    });

    if (cancelOfferId !== undefined) {
      builder.addOperation(
        StellarSdk.Operation.manageBuyOffer({
          selling: new StellarSdk.Asset(
            "USDC",
            "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
          ),
          buying: new StellarSdk.Asset(
            "BNB",
            "GANCHORKQEZ46AFTJLEVTA5MCE432MSR5VMVQBWW3LAUYGTBFTKGKTJF"
          ),
          buyAmount: "0",
          price: await this.getBNBUSDTpair("higher"),
          offerId: cancelOfferId,
        })
      );
    } else {
      builder.addOperation(
        StellarSdk.Operation.manageBuyOffer({
          selling: new StellarSdk.Asset(
            "USDC",
            "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
          ),
          buying: new StellarSdk.Asset(
            "BNB",
            "GANCHORKQEZ46AFTJLEVTA5MCE432MSR5VMVQBWW3LAUYGTBFTKGKTJF"
          ),
          buyAmount: amount,
          price: await this.getBNBUSDTpair("higher"),
        })
      );
    }

    builder.setNetworkPassphrase(StellarSdk.Networks.PUBLIC);

    builder.setTimeout(30);

    let tx = builder.build();
    tx.sign(source);

    try {
      const submitTransaction = await horizon.submitTransaction(tx);
      if (cancelOfferId !== undefined) {
        return;
      }
      const offerRes = submitTransaction.offerResults[0];
      if (offerRes.wasImmediatelyFilled) {
        let offerId = offerRes.offersClaimed[0].offerId;
        let amountSold = offerRes.amountSold;
        let soldAsset = offerRes.offersClaimed[0].assetSold.assetCode;
        this.sellRes = {
          offerId: offerId,
          filled: true,
          response: `Sell order for ${amountSold} ${soldAsset}, has just been filled.`,
        };
        console.log("Sell order filled", submitTransaction);
      } else {
        let currentOfferId =
          submitTransaction.offerResults[0].currentOffer.offerId;
        let price =
          submitTransaction.offerResults[0].currentOffer.price.d /
          submitTransaction.offerResults[0].currentOffer.price.n;
        let soldAsset =
          submitTransaction.offerResults[0].currentOffer.selling.assetCode;
        let boughtAsset =
          submitTransaction.offerResults[0].currentOffer.buying.assetCode;
        setInterval(async () => {
          return await this.updateSellOffer(
            sourceSecretKey,
            amount,
            currentOfferId
          );
        }, 60000);
        this.sellRes = {
          offerId: currentOfferId,
          filled: false,
          response: `Sell offer sent at ${price}, sold ${soldAsset}, bought ${amount} ${boughtAsset}`,
        };
        console.log("Sell Offer successfully sent!", submitTransaction);
      }
    } catch (e) {
      console.log(e);
      return "Error sending transaction, check console for more details";
    }
  }

  async updateSellOffer(sourceSecretKey, amount, currentOfferId) {
    let source = StellarSdk.Keypair.fromSecret(sourceSecretKey);
    let horizon = new StellarSdk.Server("https://horizon.stellar.org");

    let sourceAccount = await horizon.loadAccount(source.publicKey());

    let builder = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: "100000",
    });

    console.log(this.spread[this.i++]);
    builder.addOperation(
      StellarSdk.Operation.manageSellOffer({
        selling: new StellarSdk.Asset(
          "BNB",
          "GANCHORKQEZ46AFTJLEVTA5MCE432MSR5VMVQBWW3LAUYGTBFTKGKTJF"
        ),
        buying: new StellarSdk.Asset(
          "USDC",
          "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
        ),
        amount: amount,
        price: await this.getBNBUSDTpair("higher"),
        offerId: currentOfferId,
      })
    );

    builder.setNetworkPassphrase(StellarSdk.Networks.PUBLIC);

    builder.setTimeout(30);

    let tx = builder.build();
    tx.sign(source);

    try {
      const submitTransaction = await horizon.submitTransaction(tx);
      const offerRes = submitTransaction.offerResults[0];
      if (offerRes.wasImmediatelyFilled) {
        let offerId = offerRes.offersClaimed[0].offerId;
        let amountSold = offerRes.amountSold;
        let soldAsset = offerRes.offersClaimed[0].assetSold.assetCode;
        this.sellRes = {
          offerId: offerId,
          filled: true,
          response: `Sell order for ${amountSold} ${soldAsset}, has just been filled.`,
        };
        console.log("Sell order filled", submitTransaction);
      } else {
        let currentOfferId =
          submitTransaction.offerResults[0].currentOffer.offerId;
        let price =
          submitTransaction.offerResults[0].currentOffer.price.d /
          submitTransaction.offerResults[0].currentOffer.price.n;
        let soldAsset =
          submitTransaction.offerResults[0].currentOffer.selling.assetCode;
        let boughtAsset =
          submitTransaction.offerResults[0].currentOffer.buying.assetCode;
        this.sellRes = {
          offerId: currentOfferId,
          filled: false,
          response: `Updated Sell offer at ${price}, sold ${soldAsset}, bought ${amount} ${boughtAsset}`,
        };
        console.log("Updated Sell Offer successfully sent!", submitTransaction);
      }
    } catch (e) {
      console.log(e);
      return "Error sending transaction, check console for more details";
    }
  }
}
