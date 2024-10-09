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
    <main >
      <div className="flex justify-center gap-6 items-center">
        {!isConnected ? (
          <h1 className="flex md:text-2xl min-h-screen items-center">Connect your wallet to display your NFTs!</h1>
        ) : (
          <div className="flex mt-4 md:ml-6">
            <PhotoGrid blocktones={blocktones} rowLimit={5}/>
          </div>
        )}
      </div>
    </main>
  );
}
