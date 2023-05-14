export async function parseCommand(commandCSV) {
  // console.log("commandCSV", commandCSV);
  // order of args passed to ffmpeg.run() is important:
  // ffmpeg -ss <time> -i <input_file> -frames:v 1 <output_file>

  const arrayWithoutSpaces = commandCSV.map((item) =>
    item
      .replace(
        /'([^']+)'|"([^"]+)"/g,
        (match, singleQuotes, doubleQuotes) => singleQuotes || doubleQuotes
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
  // console.log("inputFile", inputFile, "outputFile", outputFile);

  // console.log("arrayWithoutSpaces: ", arrayWithoutSpaces);
  const indexToRemove = arrayWithoutSpaces.indexOf("-i");

  const slice1 = arrayWithoutSpaces.slice(0, indexToRemove);
  const slice2 = arrayWithoutSpaces.slice(indexToRemove + 2);
  const slice3 = slice2.slice(0, -1);
  // console.log("slice1", slice1, "slice2", slice2, "slice3", slice3);
  const spreadSlices1And3 = [...slice1, ...slice3];
  // console.log("spreadSlices1And3", spreadSlices1And3);
  // let inputFile, outputFile;

  const spreadFilesAndSlices = [
    ...spreadSlices1And3,
    "-i",
    inputFile,
    outputFile,
  ];
  console.log("spreadFilesAndSlices", spreadFilesAndSlices);

  const newArray = spreadFilesAndSlices.map((value) => `"${value}"`);

  console.log("newArray: ", ...newArray);

  // const csvString = spreadFilesAndSlices
  //   .map((value) => `"${value.replace(/"/g, '\\"')}"`)
  //   .join(",");
  // console.log("csvString: ", csvString);

  let parsedCommand = newArray;
  return { parsedCommand, inputFile, outputFile };
}
