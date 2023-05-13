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

const command = [
  "-ss",
  "00:00:01.000",
  "-i",
  "input.mov",
  "-frames:v",
  "1",
  "output.png",
].join(" ");

const { inputFileName, outputFileName } = parseCommand(command);

console.log("Input File Name:", inputFileName);
console.log("Output File Name:", outputFileName);

module.exports = parseCommand;
