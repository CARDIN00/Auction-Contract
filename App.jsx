import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./App.css";

const AUCTION_CONTRACT_ADDRESS = "your_contract_address";
const AUCTION_ABI = [
  [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [],
      "name": "AuctionCancelled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "winner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "highestBid",
          "type": "uint256"
        }
      ],
      "name": "AuctionEnded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "bidder",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "BidPlaced",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "CancelAuc",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "EndlAuc",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "auctioneer",
      "outputs": [
        {
          "internalType": "address payable",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "auctionstate",
      "outputs": [
        {
          "internalType": "enum Auction.auction_state",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "bid",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "bidIncrement",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "bids",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "endblock",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "finalizedAuction",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "highestBid",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "highestBidder",
      "outputs": [
        {
          "internalType": "address payable",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "highestPayaleBid",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "startblock",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
];

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [highestBid, setHighestBid] = useState("0");
  const [bidAmount, setBidAmount] = useState("");
  const [auctioneer, setAuctioneer] = useState(null);

  useEffect(() => {
    if (contract) {
      fetchAuctionDetails();
    }
  }, [contract]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const contract = new ethers.Contract(
          AUCTION_CONTRACT_ADDRESS,
          AUCTION_ABI,
          signer
        );

        setProvider(provider);
        setAccount(address);
        setContract(contract);

        fetchAuctionDetails();
      } catch (error) {
        console.error("Wallet connection failed:", error);
      }
    } else {
      alert("MetaMask not detected!");
    }
  };

  const fetchAuctionDetails = async () => {
    if (contract) {
      try {
        const bid = await contract.highestBid();
        const owner = await contract.auctioneer(); // Assuming your contract has an `auctioneer` state variable
        setHighestBid(ethers.formatEther(bid));
        setAuctioneer(owner);
      } catch (error) {
        console.error("Error fetching auction details:", error);
      }
    }
  };

  const placeBid = async () => {
    if (contract && bidAmount) {
      try {
        const tx = await contract.placeBid({
          value: ethers.parseEther(bidAmount),
        });
        await tx.wait();
        setBidAmount("");
        fetchAuctionDetails();
      } catch (error) {
        console.error("Bid placement failed:", error);
      }
    } else {
      alert("Enter a valid bid amount.");
    }
  };

  const finalizeAuction = async () => {
    if (contract) {
      try {
        const tx = await contract.finalizeAuction();
        await tx.wait();
        alert("Auction finalized!");
        fetchAuctionDetails();
      } catch (error) {
        console.error("Auction finalization failed:", error);
      }
    }
  };

  return (
    <div className="container">
      <h1 className="title">Auction dApp</h1>
      <button className="wallet-button" onClick={connectWallet}>
        {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
      </button>

      <div className="status">
        <h2>Auction Status:</h2>
        <p><strong>Highest Bid:</strong> {highestBid} ETH</p>
        <p><strong>Auctioneer:</strong> {auctioneer ? `${auctioneer.slice(0, 6)}...${auctioneer.slice(-4)}` : "Loading..."}</p>
      </div>

      {account === auctioneer ? (
        <div className="auctioneer-section">
          <h3>You are the Auctioneer</h3>
          <button onClick={finalizeAuction} className="finalize-button">Finalize Auction</button>
        </div>
      ) : (
        <div className="bid-section">
          <input
            type="number"
            placeholder="Enter Bid Amount (ETH)"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
          />
          <button onClick={placeBid} className="bid-button">Place Bid</button>
        </div>
      )}
    </div>
  );
}

export default App;
