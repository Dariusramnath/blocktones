import { NextApiRequest, NextApiResponse } from "next";
import { Network, Alchemy } from "alchemy-sdk";

const config = {
  apiKey: process.env.API_KEY,
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(config);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { data } = req.body;
    const address = data?.address;

    const contractAddress = process.env.CONTRACT_ADDRESS;

    if (!contractAddress) {
      return res.status(500).json({ error: "Contract address not found" });
    }

    try {
      const tokenIds = await getNftTokenIdsForProject(address, contractAddress);

      res.status(200).json({ tokenIds });
    } catch (error) {
      res.status(500).json({ Error: "Failed to fetch NFT token IDs" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

async function getNftTokenIdsForProject(
  ownerAddress: string,
  contractAddress: string
) {
  try {
    const nfts = await alchemy.nft.getNftsForOwner(ownerAddress, {
      contractAddresses: [contractAddress],
    });

    // console.log("NFTs owned by address:", nfts);
    if (nfts && nfts.ownedNfts && nfts.ownedNfts.length > 0) {
        const data = nfts.ownedNfts.map((nft) => ({
          tokenId: nft.tokenId,
          video: nft.image?.cachedUrl || 'No media available', // Use media first, fallback to image if available
        }));
      
        const images = nfts.ownedNfts.map((nft) => nft.image.cachedUrl);
        console.log(nfts)
        return data
    } else {
        console.log('No NFTs found for the given address.');
    }
  } catch (error) {
    console.error("Error fetching NFTs:", error);
    throw error;
  }
}
