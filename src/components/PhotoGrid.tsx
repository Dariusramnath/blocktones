import React from "react";

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

  return (
    <div>
      {photoChunks.map((chunk, rowIndex) => (
        <div key={rowIndex} className="flex md:flex-row flex-col mb-4  border-2 border-red-500">
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
    </div>
  );
};

export default PhotoGrid;

{
  /* <div key={rowIndex} className="flex md:flex-row flex-col p-3">
          {chunk.map((photo, colIndex) => (
            // <img
            //   key={colIndex}
            //   src={photo}
            //   alt={`Photo ${rowIndex * columns + colIndex + 1}`}
            //   style={{ width: '200px', height: '200px', marginRight: '10px' }}
            // />
            <video className="md:mx-1 my-1 md:w-[260px] md:h-[240px]"  controls poster="https://dl.openseauserdata.com/cache/originImage/files/a356092e7dcb2d9353a0e3fa5bffe48f.jpg">
              <source key={colIndex} src={photo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ))}
        </div> */
}
