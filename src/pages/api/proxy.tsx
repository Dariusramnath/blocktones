import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'No URL provided' });
  }

  try {
    const response = await fetch(url as string);

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch the file' });
    }

    // Set headers for the response
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
    res.setHeader('Content-Length', response.headers.get('content-length') || '0');

    // Create a reader from the fetch stream
    const reader = response.body?.getReader();

    if (!reader) {
      return res.status(500).json({ error: 'Failed to read the stream' });
    }

    // Read and pipe the stream chunks to the response
    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);  // Write chunk to the response
      }
      res.end();  // End the response once all data is sent
    };

    await pump();
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
