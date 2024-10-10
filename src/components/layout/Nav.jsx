import React from "react";
import { ConnectButton } from "thirdweb/react";
import { createWallet, walletConnect } from "thirdweb/wallets";
import { ethers } from "ethers";
import { Link } from "react-router-dom";
import { chain, client } from "../../utils/Middleware";

function Nav() {
  const wallets = [createWallet("com.coinbase.wallet")];

  return (
    <nav>
      <Link to="/" className="logo">
        <img src="./logo.png" alt="" />
      </Link>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/leaderboard">Leaderboard</Link>
        </li>
        <ConnectButton
          client={client}
          chain={chain}
          wallets={wallets}
          connectButton={{
            label: "Coinbase Smart Wallet",
          }}
          connectModal={{ size: "compact" }}
        />
      </ul>
    </nav>
  );
}

export default Nav;
