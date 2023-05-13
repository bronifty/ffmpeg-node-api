import express from "express";
import cors from "cors";
import path from "path";
import multer from "multer";
import { createFFmpeg } from "@ffmpeg/ffmpeg";
import PQueue from "p-queue";
import { processVideoToImage } from "./ffmpeg.mjs";

function parseCommand(command) {
  const regex = /-i\s+([^ ]+).*\s+(\S+)$/;
  const matches = command.match(regex);

  if (matches) {
    const inputFileName = matches[1];
    const outputFileName = matches[2];
    return { inputFileName, outputFileName };
  } else {
    // Return null or throw an error if the input format is not as expected
    return null;
  }
}

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

// console.log("Input File Name:", inputFileName);
// console.log("Output File Name:", outputFileName);

const ffmpegInstance = createFFmpeg({ log: true });
let ffmpegLoadingPromise = ffmpegInstance.load();

const requestQueue = new PQueue({ concurrency: 1 });

async function getFFmpeg() {
  if (ffmpegLoadingPromise) {
    await ffmpegLoadingPromise;
    ffmpegLoadingPromise = undefined;
  }

  return ffmpegInstance;
}

const app = express();
const port = 3000;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

app.use(cors());
// to host the static resources (index.html, client.js, etc.) at the root of the project dir; if you wanted to put it in the "public" folder, just add the word "public" in the quotations after process.cwd(), like so: app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.static(path.join(process.cwd(), "")));

app.post("/thumbnail", upload.single("video"), async (req, res) => {
  // try {

  await processVideoToImage();

  // const videoData = req.file.buffer;
  // const commandCSV = req.body.command.split(",");
  // const commandString = commandCSV.join(" ");
  // console.log("commandCSV", commandCSV, "commandString", commandString);

  // // split the command string into array
  // const filterSpaces = customCommand.filter((item) => item !== ""); // filter out any empty strings
  // console.log("customCommand", filterSpaces);
  // const joinFilterSpaces = filterSpaces.join(" "); // join the array back into a string
  // const newArray = joinFilterSpaces.map((item) =>
  //   item.replace(/"(?=.*')/g, "")
  // );
  // console.log("newArray", newArray);

  // const { inputFileName, outputFileName } = parseCommand(newArray);
  // console.log(
  //   "Input File Name:",
  //   inputFileName,
  //   "Output File Name:",
  //   outputFileName
  // );

  //   const ffmpeg = await getFFmpeg();

  //   const inputFileName = `input-video`;
  //   const outputFileName = `output-image.png`;
  //   let outputData = null;

  //   await requestQueue.add(async () => {
  //     ffmpeg.FS("writeFile", inputFileName, videoData);

  //     await ffmpeg.run(...customCommand, inputFileName, outputFileName); // include custom command

  //     outputData = ffmpeg.FS("readFile", outputFileName);
  //     ffmpeg.FS("unlink", inputFileName);
  //     ffmpeg.FS("unlink", outputFileName);
  //   });

  //   res.writeHead(200, {
  //     "Content-Type": "image/png",
  //     "Content-Disposition": `attachment;filename=${outputFileName}`,
  //     "Content-Length": outputData.length,
  //   });
  //   res.end(Buffer.from(outputData, "binary"));
  // } catch (error) {
  //   console.error(error);
  //   res.sendStatus(500);
  // }
});

app.listen(port, () => {
  console.log(`[info] ffmpeg-api listening at http://localhost:${port}`);
});
