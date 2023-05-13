import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import path from "path";
import fs from "fs";

export async function processVideoToImage({
  parsedCommand,
  inputFile,
  outputFile,
}) {
  const inputFileName = `input-video`;
  const outputFileName = `output-image.png`;
  let outputData = null;

  console.log(
    "in ffmpeg.mjs processVideoToImage",
    "parsedCommand",
    parsedCommand,
    "inputFile: ",
    inputFile,
    "outputFile: ",
    outputFile
  );

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
  // ffmpeg.FS(
  //   "writeFile",
  //   inputFile,
  //   await fetchFile(path.join(process.cwd(), "./input.mov"))
  // );
  ffmpeg.FS(
    "writeFile",
    "input.mov",
    await fetchFile(path.join(process.cwd(), "./input.mov"))
  );
  // await ffmpeg.run(
  //   "-ss",
  //   "00:00:01.000",
  //   "-i",
  //   inputFileName,
  //   "-frames:v",
  //   "1",
  //   outputFileName
  // );
  await ffmpeg.run(
    "-ss",
    "00:00:01.000",
    "-i",
    "input.mov",
    "-frames:v",
    "1",
    "output-image.png"
  );
  // outputData = ffmpeg.FS("readFile", outputFileName);
  outputData = ffmpeg.FS("readFile", "output-image.png");
  // ffmpeg.FS("unlink", inputFileName);
  // ffmpeg.FS("unlink", outputFileName);
  ffmpeg.FS("unlink", "input.mov");
  ffmpeg.FS("unlink", "output-image.png");

  // console.log("outputData", outputData);
  fs.writeFile(outputFileName, outputData, "binary", (err) => {
    if (err) {
      console.error("Error writing the image file:", err);
    } else {
      console.log("Image file saved successfully:", outputFileName);
    }
  });
}
