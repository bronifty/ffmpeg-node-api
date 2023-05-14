import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import path from "path";
import fs from "fs";
// order of args passed to ffmpeg.run() is important:
// ffmpeg -ss <time> -i <input_file> -frames:v 1 <output_file>
// -ss, 00:00:01.000, -i, input.mov, -frames:v, 1, output.png
// "-i", "input.mov", "output.mp4"

let ffmpeg = null;
const initializeFFmeg = async () => {
  const ffmpegInstance = createFFmpeg({ log: true });
  let ffmpegLoadingPromise = ffmpegInstance.load();

  async function getFFmpeg() {
    if (ffmpegLoadingPromise) {
      await ffmpegLoadingPromise;
      ffmpegLoadingPromise = undefined;
    }
    return ffmpegInstance;
  }

  ffmpeg = await getFFmpeg();
};

export async function runFFmpegJob({
  parsedCommand,
  inputFile,
  outputFile,
  mediaFile,
}) {
  let outputData = null;
  await initializeFFmeg();
  ffmpeg.FS(
    "writeFile",
    inputFile,
    await fetchFile(mediaFile)
    // await fetchFile(path.join(process.cwd(), "./lib/input.mov"))
  );

  try {
    await ffmpeg.run(...parsedCommand);
  } catch (error) {
    console.log("error", error);
  }

  outputData = ffmpeg.FS("readFile", outputFile);
  ffmpeg.FS("unlink", inputFile);
  ffmpeg.FS("unlink", outputFile);

  // fs.writeFile(outputFile, outputData, "binary", (err) => {
  //   if (err) {
  //     console.error("Error writing the image file:", err);
  //   } else {
  //     console.log("Image file saved successfully:", outputFile);
  //   }
  // });
  return { outputData };
}
