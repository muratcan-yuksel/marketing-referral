import React, { useState, useEffect, MouseEventHandler } from "react";
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
  const [referrer, setReferrer] = useState<string>();
  const [userLevel, setUserLevel] = useState<number>();
  const [earnings, setEarnings] = useState<number>();

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

  const register: MouseEventHandler<HTMLButtonElement> = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
      const tx = await contract.register(referrer, {
        value: ethers.parseEther("0.25"),
      });
      console.log(tx);

      const receipt = await tx.wait();

      console.log(receipt);
    } catch (error) {
      console.log("error", error);
    }
  };

  const getLevel = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
      const signer = await provider.getSigner();
      console.log(contract);
      //deployer address here to be removed
      const deployerAddress = await signer.getAddress();
      console.log(deployerAddress);
      const level = await contract.getUserLevel(walletProvider);
      console.log(Number(level));
      setUserLevel(Number(level));
    } catch (error) {
      console.log("error", error);
    }
  };

  const getBalance = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
      const signer = await provider.getSigner();
      console.log(contract);
      const balance = await contract.getUserBalance(walletProvider);
      console.log(Number(balance));
      setEarnings(Number(balance));
    } catch (error) {
      console.log("error", error);
    }
  };

  const levelUp: MouseEventHandler<HTMLButtonElement> = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
      const tx = await contract.levelUp({
        value: ethers.parseEther("0.5"),
      });
      console.log(tx);

      const receipt = await tx.wait();

      console.log(receipt);
    } catch (error) {
      console.log("error", error);
    }
  };

  const withdraw: MouseEventHandler<HTMLButtonElement> = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
      const tx = await contract.withdraw();
      console.log(tx);

      const receipt = await tx.wait();

      console.log(receipt);
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    walletConnected && console.log(walletProvider);
    getLevel();
    getBalance();
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
          onChange={(e) => setReferrer(e.target.value)}
        />
        <button
          onClick={register}
          className="p-4 border text-3xl border-yellow-600 m-6"
        >
          Register
        </button>

        <div className="flex justify-around w-full">
          <h1 className="text-3xl">Level: {userLevel} </h1>
          <h1 className="text-3xl">Earnings:{earnings} </h1>
        </div>
        <button
          onClick={levelUp}
          className="p-4 border text-3xl border-green-600 m-6"
        >
          Level Up
        </button>
        <button
          onClick={withdraw}
          className="p-4 border text-3xl border-red-600 m-6"
        >
          Withdraw funds
        </button>
      </div>
    </div>
  );
};

export default Home;
