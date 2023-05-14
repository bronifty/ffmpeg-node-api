import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import path from "path";
import fs from "fs";

const ffmpegInstance = createFFmpeg({ log: true });
let ffmpegLoadingPromise = ffmpegInstance.load();

(async () => {
  const tempCommand = [
    "-ss",
    "00:00:01.000",
    "-i",
    "input.mov",
    "-frames:v",
    "1",
    "output.png",
  ].join(" ");
  const tempCommand2 = tempCommand.split(" ");
  console.log("tempCommand", tempCommand, "tempCommand2", tempCommand2);

  const inputFileName = `input-video`;
  const outputFileName = `output-image.png`;
  let outputData = null;

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

  console.log("outputData", outputData);
  fs.writeFile(outputFileName, outputData, "binary", (err) => {
    if (err) {
      console.error("Error writing the image file:", err);
    } else {
      console.log("Image file saved successfully:", outputFileName);
    }
  });

  ffmpeg.FS("unlink", inputFileName);
  ffmpeg.FS("unlink", outputFileName);
})();
