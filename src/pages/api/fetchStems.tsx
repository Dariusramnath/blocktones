// pages/api/fetchNftJson.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { tokenId } = req.query;

  if (!tokenId) {
    return res.status(400).json({ error: "Token ID is required" });
  }

  const url = `https://ipfs.io/ipfs/bafybeigtmbztn4v7fu5ya4d5qzsql6b7soacmm3gdd4gnxgt4v235am34q/${tokenId}.json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch JSON data");
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error });
  }
}
