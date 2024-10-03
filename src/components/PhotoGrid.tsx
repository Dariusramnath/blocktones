import React from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

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

  const downloadZip = async () => {
    const zip = new JSZip();

    // Define the URLs for the files you want to download
    const filesToDownload = [
      {
        url: "https://blocktones1.s3.amazonaws.com/audio/20.wav",
        filename: "20.wav",
      },
      {
        url: "https://blocktones1.s3.amazonaws.com/2160p/210.mp4",
        filename: "210.mp4",
      },
      {
        url: "https://blocktones1.s3.amazonaws.com/stems/Alive-Again.wav",
        filename: "Alive-Again.wav",
      },
    ];

    // Add each file to the ZIP
    for (const file of filesToDownload) {
      try {
        const response = await fetch(file.url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blob = await response.blob();
        zip.file(file.filename, blob);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    }

    // Generate the ZIP file
    const content = await zip.generateAsync({ type: "blob" });

    // Use the saveAs function from file-saver to trigger the download
    saveAs(content, "blocktones-files.zip");
  };

  return (
    <div>
      {photoChunks.map((chunk, rowIndex) => (
        <div
          key={rowIndex}
          className="flex md:flex-row flex-col mb-4  border-2 border-red-500"
        >
          {chunk.map((nft, colIndex) => (
            <div key={colIndex} className="mx-1">
              <video
                className="md:mx-1 my-1 md:w-[260px] md:h-[240px]"
                controls
                // poster={nft.video}
                poster={`https://blocktones1.s3.amazonaws.com/album_art/${nft.tokenId}.jpg`}
              >
                <source src={nft.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <p>{nft.tokenId}</p> {/* Display tokenId */}
            </div>
          ))}
        </div>
      ))}
      <button
        onClick={downloadZip}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Download ZIP
      </button>
    </div>
  );
};

export default PhotoGrid;
