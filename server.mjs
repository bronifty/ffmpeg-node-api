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
  try {
    const videoData = req.file.buffer;
    const commandCSV = req.body.command.split(",");
    let outputData = null;

    const { parsedCommand, inputFile, outputFile } = await parseCommand(
      commandCSV
    );
    console.log(
      `[in server.mjs app.post] parsedCommand: ${parsedCommand} inputFile: ${inputFile} outputFile: ${outputFile}`
    );

    await requestQueue.add(async () => {
      const { outputData: tempData } = await processVideoToImage({
        parsedCommand,
        inputFile,
        outputFile,
      });
      outputData = tempData;
    });
    res.writeHead(200, {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment;filename=${outputFile}`,
      "Content-Length": outputData.length,
    });
    res.end(Buffer.from(outputData, "binary"));
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.listen(port, () => {
  console.log(`[info] ffmpeg-api listening at http://localhost:${port}`);
});
