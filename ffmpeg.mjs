import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import path from "path";
import fs from "fs";

export async function processVideoToImage() {
  const ffmpegInstance = createFFmpeg({ log: true });
  let ffmpegLoadingPromise = ffmpegInstance.load();

  async function getFFmpeg() {
    if (ffmpegLoadingPromise) {
      await ffmpegLoadingPromise;
      ffmpegLoadingPromise = undefined;
    }
    return ffmpegInstance;
  }

  const inputFileName = `input-video`;
  const outputFileName = `output-image.png`;
  let outputData = null;

  const ffmpeg = await getFFmpeg();
  ffmpeg.FS(
    "writeFile",
    inputFileName,
    await fetchFile(path.join(process.cwd(), "./input.mov"))
  );
  await ffmpeg.run(
    "-ss",
    "00:00:01.000",
    "-i",
    inputFileName,
    "-frames:v",
    "1",
    outputFileName
  );
  outputData = ffmpeg.FS("readFile", outputFileName);
  ffmpeg.FS("unlink", inputFileName);
  ffmpeg.FS("unlink", outputFileName);

  console.log("outputData", outputData);
  fs.writeFile(outputFileName, outputData, "binary", (err) => {
    if (err) {
      console.error("Error writing the image file:", err);
    } else {
      console.log("Image file saved successfully:", outputFileName);
    }
  });
}
