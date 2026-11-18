// Create the one-time deployer wallet. The key is stored ONLY in ./.deployer/
// (gitignored, chmod 600). Prints the address, never the key.
const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

const dir = path.join(__dirname, "..", ".deployer");
const file = path.join(dir, "deployer.json");
if (fs.existsSync(file)) {
  const saved = JSON.parse(fs.readFileSync(file, "utf8"));
  console.log("Deployer already exists:", saved.address);
  process.exit(0);
}
fs.mkdirSync(dir, { recursive: true });
const wallet = ethers.Wallet.createRandom();
fs.writeFileSync(file, JSON.stringify({ address: wallet.address, privateKey: wallet.privateKey }, null, 2), { mode: 0o600 });
console.log("Deployer created:", wallet.address);
