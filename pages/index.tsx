import React, { useState, useEffect } from "react";
import { BrowserProvider, ethers } from "ethers";
import { abi } from "../constants/index";
import backgroundImg from "../public/aurora.jpg";

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
    <div className=" h-full bgImage">
      <div className="flex justify-end ">
        {walletProvider ? (
          <h1>Wallet Connected: {walletProvider}</h1>
        ) : (
          <button
            className="border border-spacing-4 border-blue-500 p-4 text-xl"
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
        )}
      </div>
      <div className="flex flex-col justify-center items-center h-full ">
        <input
          type="text "
          className="bg-transparent text-2xl border border-blue-600 border p-2"
          placeholder="Referrer address"
        />
        <button className="p-4 border text-3xl border-yellow-600 m-6">
          Register
        </button>

        <div className="flex justify-around w-full">
          <h1 className="text-3xl">Level: </h1>
          <h1 className="text-3xl">Earnings: </h1>
        </div>
        <button className="p-4 border text-3xl border-red-600 m-6">
          Withdraw funds
        </button>
      </div>
    </div>
  );
};

export default Home;
