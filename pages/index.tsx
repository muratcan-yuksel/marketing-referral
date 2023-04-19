import React, { useState, useEffect } from "react";
import { BrowserProvider, ethers } from "ethers";
import { abi } from "../constants/index";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const Home = () => {
  const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const [walletConnected, setWalletConnected] = useState(false);
  const [walletProvider, setWalletProvider] = useState<string>();

  const connectWallet = async () => {
    try {
      let signer = null;

      let provider;
      if (window.ethereum == null) {
        console.log("MetaMask not installed; using read-only defaults");
        provider = ethers.getDefaultProvider("localhost");
      } else {
        provider = new ethers.BrowserProvider(window.ethereum);
        // await provider.send("eth_requestAccounts", []);

        console.log(provider);
        signer = await provider.getSigner();
        setWalletProvider(signer.address);
      }

      setWalletConnected(false);
      console.log(CONTRACT_ADDRESS, abi, signer);
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    walletConnected && console.log(walletProvider);
    // Listen for disconnect event
    window.ethereum.on("disconnect", () => {
      console.log("Wallet disconnected");
      setWalletConnected(false);
    });
  }, []);
  return (
    <div>
      {walletProvider ? (
        <h1>Wallet Connected: {walletProvider}</h1>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
};

export default Home;
