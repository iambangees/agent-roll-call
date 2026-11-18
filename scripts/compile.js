// Compile all contracts in ./contracts with solc and write artifacts to ./build
const fs = require("fs");
const path = require("path");
const solc = require("solc");

const contractsDir = path.join(__dirname, "..", "contracts");
const buildDir = path.join(__dirname, "..", "build");
fs.mkdirSync(buildDir, { recursive: true });

const sources = {};
for (const file of fs.readdirSync(contractsDir)) {
  if (file.endsWith(".sol")) {
    sources[file] = { content: fs.readFileSync(path.join(contractsDir, file), "utf8") };
  }
}

const input = {
  language: "Solidity",
  sources,
  settings: {
    evmVersion: "shanghai",
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { "*": { "*": ["abi", "metadata", "evm.bytecode.object", "evm.deployedBytecode.object"] } },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
let failed = false;
for (const entry of output.errors || []) {
  console.log(entry.severity.toUpperCase() + ": " + entry.formattedMessage);
  if (entry.severity === "error") failed = true;
}
if (failed) process.exit(1);

for (const [file, contracts] of Object.entries(output.contracts)) {
  for (const [name, artifact] of Object.entries(contracts)) {
    fs.writeFileSync(
      path.join(buildDir, name + ".json"),
      JSON.stringify({ contractName: name, sourceFile: file, abi: artifact.abi, bytecode: artifact.evm.bytecode.object }, null, 2)
    );
    if (artifact.metadata) {
      fs.writeFileSync(path.join(buildDir, name + ".metadata.json"), artifact.metadata);
    }
    console.log(`compiled ${name} (from ${file}), bytecode ${artifact.evm.bytecode.object.length / 2} bytes`);
  }
}
console.log("solc version:", solc.version());
