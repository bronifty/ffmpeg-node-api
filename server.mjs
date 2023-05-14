import express from "express";
import cors from "cors";
import path from "path";
import multer from "multer";
import PQueue from "p-queue";
import { processVideoToImage } from "./ffmpeg.mjs";
import { parseCommand } from "./utils.mjs";
import { log } from "console";

const requestQueue = new PQueue({ concurrency: 1 });
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
  const videoData = req.file.buffer;
  const commandCSV = req.body.command.split(",");

  const { parsedCommand, inputFile, outputFile } = await parseCommand(
    commandCSV
  );
  console.log(
    `[in server.mjs app.post] parsedCommand: ${parsedCommand} inputFile: ${inputFile} outputFile: ${outputFile}`
  );

  await processVideoToImage({ parsedCommand, inputFile, outputFile });

  // console.log(
  //   "parsedCommand",
  //   parsedCommand,
  //   "inputFile: ",
  //   inputFile,
  //   "outputFile: ",
  //   outputFile
  // );

  // console.log("spreadFilesAndSlices", spreadFilesAndSlices);
  // const joinSpreadFilesAndSlices = spreadFilesAndSlices.join(" ");
  // console.log("joinSpreadFilesAndSlices", joinSpreadFilesAndSlices);
  // console.log("spreadFilesAndSlices", ...spreadFilesAndSlices);
  // console.log("Input File:", inputFile);
  // console.log("Output File:", outputFile);
  // let spreadArray = [...arrayWithoutSpaces, "-i", inputFile, outputFile];
  // console.log("spreadArray", spreadArray);

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
