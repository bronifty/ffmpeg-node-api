import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import path from "path";
import fs from "fs";

export async function processVideoToImage({
  parsedCommand,
  inputFile,
  outputFile,
}) {
  let outputData = null;

  const ffmpegInstance = createFFmpeg({ log: true });
  let ffmpegLoadingPromise = ffmpegInstance.load();

  async function getFFmpeg() {
    if (ffmpegLoadingPromise) {
      await ffmpegLoadingPromise;
      ffmpegLoadingPromise = undefined;
    }
    return ffmpegInstance;
  }

  const ffmpeg = await getFFmpeg();
  ffmpeg.FS(
    "writeFile",
    inputFile,
    await fetchFile(path.join(process.cwd(), "./input.mov"))
  );

  try {
    await ffmpeg.run(...parsedCommand);
  } catch (error) {
    console.log("error", error);
  }

  outputData = ffmpeg.FS("readFile", outputFile);
  ffmpeg.FS("unlink", inputFile);
  ffmpeg.FS("unlink", outputFile);

  fs.writeFile(outputFile, outputData, "binary", (err) => {
    if (err) {
      console.error("Error writing the image file:", err);
    } else {
      console.log("Image file saved successfully:", outputFile);
    }
  });
}
