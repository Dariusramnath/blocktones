"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  useAccount,
  useSendTransaction,
  useSignMessage,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";
import { toast } from "sonner";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import PhotoGrid from "@/components/PhotoGrid";

export default function Home() {
  const photosArray = [
    "https://blocktones1.s3.amazonaws.com/1080p/1680.mp4",
    "https://blocktones1.s3.amazonaws.com/1080p/1680.mp4",
    "https://blocktones1.s3.amazonaws.com/1080p/1680.mp4",
    "https://blocktones1.s3.amazonaws.com/1080p/1680.mp4",
    "https://blocktones1.s3.amazonaws.com/1080p/1680.mp4",
    "https://blocktones1.s3.amazonaws.com/1080p/1680.mp4",
    "https://blocktones1.s3.amazonaws.com/1080p/1680.mp4",
  ];
  const [blocktones, setBlocktones] = useState<
    Array<{ tokenId: string; video: string }>
  >([]);

  const { isConnected, address } = useAccount();
  const { signMessage } = useSignMessage();
  const { sendTransaction, data: hash } = useSendTransaction();
  const { open } = useWeb3Modal();
  const handleConnect = () => {
    open();
  };
  const {
    isLoading: isConfirming,
    error,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (blocktones && blocktones.length > 0) {
      blocktones.forEach((nft) => {
        console.log(`Token ID: ${nft.tokenId}`);
        console.log(`Video URL: ${nft.video}`);
      });
    } else {
      console.log("No blocktones data available.");
    }
    if (isConfirming) {
      toast.loading("Transaction Pending");
    }
    toast.dismiss();

    if (isConfirmed) {
      toast.success("Transaction Successful", {
        action: {
          label: "View on Etherscan",
          onClick: () => {
            window.open(`https://explorer-testnet.morphl2.io/tx/${hash}`);
          },
        },
      });
    }
    if (error) {
      toast.error("Transaction Failed");
    }
  }, [isConfirming, isConfirmed, error, hash, blocktones]);

  async function handleApi() {
    try {
      const response = await fetch("/api/fetchBlocks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: { address } }), // ensure address is correctly defined elsewhere in your code
      });

      if (!response.ok) {
        throw new Error("Failed to send request");
      }

      const result = await response.json();

      if (result.tokenIds && Array.isArray(result.tokenIds)) {
        // Set the blocktones state with the retrieved tokenIds
        setBlocktones(result.tokenIds); // result.tokenIds is an array of { tokenId, video } objects
        console.log("Result: ", result.tokenIds);
      } else {
        console.log("No token IDs found.");
      }
    } catch (error) {
      console.error("Error sending request:", error);
    }
  }

  useEffect(() => {
    if (isConnected) {
      handleApi();
    }
  }, [isConnected]);

  return (
    <main className="">
      <div className="flex justify-center gap-6 border-2 border-red-500 items-center min-h-screen">
        {!isConnected ? (
          <h1 className="md:text-2xl">Connect your wallet to display your NFTs!</h1>
        ) : (
          <div className="flex mt-4 md:ml-6">
            <PhotoGrid blocktones={blocktones} rowLimit={5} />
          </div>
        )}
      </div>
    </main>
  );
}
