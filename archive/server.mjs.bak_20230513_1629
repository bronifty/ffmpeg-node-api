import express from "express";
import cors from "cors";
import path from "path";
import multer from "multer";
import { createFFmpeg } from "@ffmpeg/ffmpeg";
import PQueue from "p-queue";

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
  try {
    const videoData = req.file.buffer;

    const ffmpeg = await getFFmpeg();

    const inputFileName = `input-video`;
    const outputFileName = `output-image.png`;
    let outputData = null;

    await requestQueue.add(async () => {
      ffmpeg.FS("writeFile", inputFileName, videoData);

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
    });

    res.writeHead(200, {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment;filename=${outputFileName}`,
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
