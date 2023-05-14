export async function parseCommand(commandCSV) {
  console.log("commandCSV", commandCSV);
  // order of args passed to ffmpeg.run() is important:
  // ffmpeg -ss <time> -i <input_file> -frames:v 1 <output_file>
  // -ss, 00:00:01.000, -i, input.mov, -frames:v, 1, output.png
  // "-i", "input.mov", "output.mp4"

  const arrayWithoutSpaces = commandCSV.map((item) =>
    item
      .replace(
        /`([^`]+)`|'([^']+)'|"([^"]+)"/g,
        (match, templateQuotes, singleQuotes, doubleQuotes) =>
          templateQuotes || singleQuotes || doubleQuotes
      )
      .trim()
  );

  const getFileNames = (array) => {
    let inputFile, outputFile;
    for (let i = 0; i < arrayWithoutSpaces.length; i++) {
      if (arrayWithoutSpaces[i] === "-i" && i < arrayWithoutSpaces.length - 1) {
        inputFile = arrayWithoutSpaces[i + 1];
      }
      if (i === arrayWithoutSpaces.length - 1) {
        outputFile = arrayWithoutSpaces[i];
      }
    }
    return { inputFile, outputFile };
  };
  const { inputFile, outputFile } = getFileNames(arrayWithoutSpaces);
  return { parsedCommand: arrayWithoutSpaces, inputFile, outputFile };
}

export async function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.onabort = () => reject(new Error("Read aborted"));
  });
}

export async function transformMedia({ file, command, API_ENDPOINT }) {
  const payload = new FormData();
  payload.append("file", file);
  payload.append("command", command);

  const res = await fetch(API_ENDPOINT, {
    method: "POST",
    body: payload,
  });

  if (!res.ok) {
    throw new Error("Creating thumbnail failed");
  }

  const mediaBlog = await res.blob();
  const media = await blobToDataURL(mediaBlog);

  return media;
}
