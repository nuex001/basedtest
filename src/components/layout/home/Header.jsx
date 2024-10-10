import React from "react";
import { ConnectButton } from "thirdweb/react";
import { createWallet, walletConnect } from "thirdweb/wallets";
import { ethers } from "ethers";
import { Link } from "react-router-dom";
import { chain, client } from "../../../utils/Middleware";
function Header() {
  const wallets = [createWallet("com.coinbase.wallet")];
  return (
    <header style={{ backgroundImage: ' url("./basebg.jpg")' }}>
      {/* <img src={bg} alt="" /> */}
      <div className="text">
        <h1>Get Base Testnet Tokens</h1>
        <p>
          Request Base testnet tokens and test Your Dapps. Build the next Future
        </p>
        <p>Also contribute and Drive points for future Dapps</p>
      </div>
      <ConnectButton
        client={client}
        chain={chain}
        wallets={wallets}
        connectButton={{
          label: "Coinbase Smart Wallet",
        }}
        connectModal={{ size: "compact" }}
      />
    </header>
  );
}

export default Header;
