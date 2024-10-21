import React, { useEffect, useState } from "react";
import lock from "../../assets/images/lock4.png";
import "../../assets/css/home.css";
import Header from "../layout/home/Header";
import { useActiveAccount } from "thirdweb/react";
import { ethers } from "ethers";
import {
  resolveAddress,
  BASENAME_RESOLVER_ADDRESS,
} from "thirdweb/extensions/ens";
import { base } from "thirdweb/chains";
import { GrTrophy } from "react-icons/gr";
import { GiEmptyHourglass, GiImpLaugh } from "react-icons/gi";
import { getDatabase, ref, set, get } from "firebase/database";
import { dbApp, wallet } from "../../utils/db";
import { client } from "../../utils/Middleware";
import { FaRegSadTear } from "react-icons/fa";
import { FcDonate } from "react-icons/fc";
import ReCAPTCHA from "react-google-recaptcha";

function Home() {
  // const address = useAddress();
  const account = useActiveAccount();
  const [connectedAddr, setConnectedAddr] = useState(null);
  const [reqAddress, setReqAddress] = useState("");
  const [doAmount, setDoAmount] = useState("");
  const [popUpstage, setPopUpstage] = useState(0);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  //  DB
  const db = getDatabase();
  useEffect(() => {
    // console.log(account.address);
    if (account) {
      setConnectedAddr(account.address);
    } else {
      setConnectedAddr(null);
    }
  }, [account]);

  const handleCaptchaChange = (value) => {
    console.log("Captcha value:", value);
    if (value) {
      setCaptchaVerified(true); // Captcha is verified
    } else {
      setCaptchaVerified(false); // Captcha is not verified
    }
  };

  const donateEth = async (e) => {
    e.preventDefault();
    try {
      const publicAddress = await wallet.getAddress();
      const tx = await account.sendTransaction({
        to: publicAddress,
        value: ethers.utils.parseEther(doAmount), // Convert ETH to Wei
      });
      // Reference to the donation data in Firebase
      const donateRef = ref(db, "donations/" + connectedAddr);

      // Retrieve the current donation amount (if it exists)
      const snapshot = await get(donateRef);
      let currentDonation = 0;

      // Check if donation already exists for the user
      if (snapshot.exists()) {
        const donationData = snapshot.val();
        currentDonation = parseFloat(donationData.donateAmount) || 0;
      }

      // Add the new donation amount to the current donation
      const updatedDonationAmount = currentDonation + parseFloat(doAmount);

      // Update Firebase with the new total donation amount
      await set(donateRef, {
        donateAmount: updatedDonationAmount.toString(), // Store as string to avoid floating-point precision issues
      });

      setPopUpstage(5);
    } catch (error) {
      console.log(error);
    }
  };

  const requestEth = async (e) => {
    e.preventDefault();
    try {
      let amount;
      let recipientAddress;
      if (reqAddress !== "" && captchaVerified) {
        setPopUpstage(1);
        if (reqAddress.toString().includes("base")) {
          console.log("base");
          const address = await resolveAddress({
            client,
            name: reqAddress,
            resolverAddress: BASENAME_RESOLVER_ADDRESS,
            resolverChain: base,
          });
          amount = "0.05";
          recipientAddress = address;
        } else {
          amount = "0.02";
          recipientAddress = reqAddress;
        }
        console.log(recipientAddress);
        // Fetch user's IP
        const response = await fetch("https://api.ipify.org?format=json");
        const Ipdata = await response.json();
        const userRef = ref(db, "users/" + recipientAddress);
        const sanitizedIp = Ipdata.ip.replace(/\./g, "-");
        const ipRef = ref(db, "ipRequests/" + sanitizedIp);
        // Check if this address or IP has made a recent request
        const userSnapshot = await get(userRef);
        const ipSnapshot = await get(ipRef);

        let recentRequest = false;

        if (userSnapshot.exists()) {
          const data = userSnapshot.val();
          const requestedDate = new Date(data.requestedDate);
          const currentDate = new Date();
          const timeDifference = Math.abs(currentDate - requestedDate);
          const hoursDifference = timeDifference / (1000 * 60 * 60);

          if (hoursDifference < 4) {
            console.log(
              "Request denied: Less than 4 hours since last request for this address."
            );
            setPopUpstage(3);
            return;
          }
        }

        if (ipSnapshot.exists()) {
          const ipData = ipSnapshot.val();
          const requestedDate = new Date(ipData.requestedDate);
          const currentDate = new Date();
          const timeDifference = Math.abs(currentDate - requestedDate);
          const hoursDifference = timeDifference / (1000 * 60 * 60);

          if (hoursDifference < 4) {
            console.log(
              "Request denied: Less than 4 hours since last request from this IP."
            );
            setPopUpstage(3);
            return;
          }
        }

        // Convert the donation amount to Wei (ETH -> Wei)
        const amountInWei = ethers.utils.parseEther(amount); // You can use thirdweb.utils to handle conversions

        // Send transaction
        const tx = await wallet.sendTransaction({
          to: recipientAddress, // Recipient's address
          value: amountInWei, // Amount to send (in Wei)
        });

        // Proceed with the request if checks pass
        if (Ipdata) {
          await set(userRef, {
            requested: amount,
            Ip: Ipdata.ip, // Store IP
            requestedDate: new Date().toISOString(), // Store in ISO format
          });

          await set(ipRef, {
            requested: amount,
            recipientAddress: recipientAddress, // Store address for reference
            requestedDate: new Date().toISOString(), // Store in ISO format
          });

          setPopUpstage(2); // Success stage
        }
      }
    } catch (error) {
      if (error.toString().includes("insufficient funds")) {
        setPopUpstage(6); // Error stage
      } else {
        setPopUpstage(4); // Error stage
      }

      console.error("Error processing request:", error);
    }
  };

  const closePopUp = (e) => {
    e.preventDefault();
    setPopUpstage(0);
  };

  /**
   * 
nuelyoungtech.base.eth
   */
  return (
    <div className="home">
      <Header />
      <main>
        <div className="tokensBox">
          <h2>Get your Tokens!</h2>
          <h3>0.02 ETH/ 2hrs</h3>
          <p>
            To receive drips, please enter your wallet address in the provided
            box and click on the "Claim" button to initiate the process, You can
            claim. Start exploring the endless possibilities of Web3 with our
            powerful faucet! Please note that only one claim per 4 hours is
            permitted!
          </p>
          <p>
            <span>Note:</span> You can claim up to 0.05, if you use basename
          </p>
          <form action="" onSubmit={requestEth}>
            <input
              type="text"
              placeholder="Input Your Base wallet address or basename"
              onChange={(e) => {
                setReqAddress(e.target.value);
              }}
              value={reqAddress}
            />
            <ReCAPTCHA
              sitekey="6Lfw3l0qAAAAAEpgy3-hO5Pt48ZwzmyS8eZFqO9A" // Replace with your site key from Google reCAPTCHA
              onChange={handleCaptchaChange}
            />
            <button>Claim</button>
          </form>
        </div>
        <div className="supportBox">
          <h2>Donate your Tokens!</h2>
          <p>
            When you donate, you rank up points for future developements, rank
            up alot. Probably Nothing
          </p>
          {connectedAddr ? (
            <form action="" onSubmit={donateEth}>
              <input
                type="tel"
                placeholder="Input Amount to donate"
                onChange={(e) => {
                  setDoAmount(e.target.value);
                }}
                value={doAmount}
              />
              <button>Donate</button>
            </form>
          ) : (
            <img src={lock} alt="" />
          )}
          {/* <img src={lock} alt="" /> */}
        </div>
      </main>
      {popUpstage > 0 && (
        <div className="overlay">
          <div className="popUpbox">
            {popUpstage === 1 ? (
              <div className="loader"></div>
            ) : popUpstage === 2 ? (
              <div className="box">
                <GrTrophy className="icon" />
                <h1>Congrats</h1>
                <p>Eth has been deposited to your wallet</p>
                <button onClick={closePopUp}>OK</button>
              </div>
            ) : popUpstage === 3 ? (
              <div className="box">
                <GiImpLaugh className="icon" />
                <h1>Want to sneak in</h1>
                <p>Less than 4 hours since last request</p>
                <button onClick={closePopUp}>Shift</button>
              </div>
            ) : popUpstage === 4 ? (
              <div className="box">
                <FaRegSadTear className="icon" />
                <h1>Server Error</h1>
                <p>Please try again later</p>
                <button onClick={closePopUp}>OK</button>
              </div>
            ) : popUpstage === 5 ? (
              <div className="box">
                <FcDonate className="icon" />
                <h1>Thanks for the donations</h1>
                <p>Impossible is just a stroll away</p>
                <button onClick={closePopUp}>OK</button>
              </div>
            ) : (
              popUpstage === 6 && (
                <div className="box">
                  <GiEmptyHourglass className="icon" />
                  <h1>Vault is Empty</h1>
                  <p>
                    Please try again later or you can spread the word for more
                    donations
                  </p>
                  <button onClick={closePopUp}>OK</button>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
