import React from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "sonner";

type Attribute = {
  trait_type: string;
  value: string;
};

type FileToDownload = {
  url: string;
  filename: string;
};

interface PhotoGridProps {
  blocktones: Array<{ tokenId: string; video: string }>; // Updated to handle tokenId and video
  rowLimit: number;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ blocktones, rowLimit }) => {
  const columns = 5; // Number of columns per row

  // Break the array into chunks of 5 columns per row
  const chunkArray = (arr: any[], size: number) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  const photoChunks = chunkArray(blocktones, columns).slice(0, rowLimit);

  const downloadZip = async (
    filesToDownload: FileToDownload[],
    tokenId: string
  ) => {
    try {
      toast.loading("Retrieving Files ...");
      const zip = new JSZip();

      for (const file of filesToDownload) {
        const response = await fetch(
          `/api/proxy?url=${encodeURIComponent(file.url)}`
        );
        if (response.ok) {
          const blob = await response.blob();
          zip.file(file.filename, blob);
        } else {
          // console.error(`Failed to fetch file: ${file.filename}`);
        }
      }
      toast.dismiss()
      toast.loading("Zipping Files ...")
      const content = await zip.generateAsync({ type: "blob" });
      toast.dismiss()
      
      toast.success("Download complete!")
      console.log("Download should be finished");
      saveAs(content, `${tokenId}.zip`);
    } catch (error) {
      console.error("Error downloading files:", error);
    }
  };

  const fetchStems = async (tokenId: string) => {
    const url = `https://ipfs.io/ipfs/bafybeigtmbztn4v7fu5ya4d5qzsql6b7soacmm3gdd4gnxgt4v235am34q/${tokenId}.json`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch JSON data");
      }

      const data = await response.json();

      // Process the attributes to create the file list
      const fileList = generateFileList(data.attributes);

      const additionalFiles = [
        {
          url: `https://blocktones1.s3.amazonaws.com/audio/${tokenId}.wav`,
          filename: `${tokenId}.wav`,
        },
        {
          url: `https://blocktones1.s3.amazonaws.com/album_art/${tokenId}.jpg`,
          filename: `${tokenId}.jpg`,
        },
        {
          url: `https://blocktones1.s3.amazonaws.com/2160p/${tokenId}.mp4`,
          filename: `${tokenId}.mp4`,
        },
      ];

      // Concatenate the additional files to the file list
      const completeFileList = [...fileList, ...additionalFiles];

      console.log(completeFileList);

      // Optionally, trigger download for each file
      await downloadZip(completeFileList, tokenId);
    } catch (error) {
      console.error("Error fetching JSON data:", error);
    }
  };

  const generateFileList = (attributes: Attribute[]) => {
    return attributes.map((attr) => {
      const valueWithDashes = attr.value.replace(/\s+/g, "-"); // Replace spaces with dashes
      return {
        url: `https://blocktones1.s3.amazonaws.com/stems/${valueWithDashes}.wav`, // Construct the URL
        filename: `${valueWithDashes}.wav`, // Construct the filename
      };
    });
  };

  return (
    <div>
      {photoChunks.map((chunk, rowIndex) => (
        <div key={rowIndex} className="flex md:flex-row flex-col mb-4">
          {chunk.map((nft, colIndex) => (
            <div key={colIndex} className="md:mx-1 mx-2 border-y border-gray-600 rounded-xl mb-4 md:mb-0">
              <video
                className="md:mx-1 mt-1 md:w-[260px] md:h-[240px]"
                controls
                poster={`https://blocktones1.s3.amazonaws.com/album_art/${nft.tokenId}.jpg`}
              >
                <source src={nft.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="mx-3 mb-1 flex flex-row items-end justify-between">
                <p className="font-mono">Token # {nft.tokenId}</p>{" "}
                {/* Display tokenId */}
                <button
                  className="bg-white text-white p-1 rounded mt-2"
                  onClick={() => fetchStems(nft.tokenId)}
                >
                  <svg
                    width="24px"
                    height="24px"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  >
                    <g id="Complete">
                      <g id="download">
                        <path
                          d="M3,12.3v7a2,2,0,0,0,2,2H19a2,2,0,0,0,2-2v-7"
                          stroke="#000000"
                        />
                        <polyline
                          points="7.9 12.3 12 16.3 16.1 12.3"
                          stroke="#000000"
                        />
                        <line
                          x1="12"
                          y1="2.7"
                          x2="12"
                          y2="14.2"
                          stroke="#000000"
                        />
                      </g>
                    </g>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
      {/* <button
        onClick={downloadZip}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Download ZIP
      </button> */}
    </div>
  );
};

export default PhotoGrid;
