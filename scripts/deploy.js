// Deploy AgentRollCall.
//   node scripts/deploy.js testnet  -> rehearsal on BSC testnet with MockAgentId
//   node scripts/deploy.js mainnet  -> real deployment against the official registry
// Deployer key is read from ./.deployer/deployer.json (never printed).
const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

const REAL_REGISTRY = "0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F";
const NETWORKS = {
  testnet: { rpc: "https://data-seed-prebsc-2-s1.binance.org:8545", chainId: 97 },
  mainnet: { rpc: "https://bsc-dataseed.binance.org", chainId: 56 },
};

function artifact(name) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "..", "build", name + ".json"), "utf8"));
}

(async () => {
  const network = process.argv[2];
  if (!NETWORKS[network]) throw new Error("Usage: node scripts/deploy.js testnet|mainnet");
  const cfg = NETWORKS[network];

  const { privateKey, address } = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", ".deployer", "deployer.json"), "utf8")
  );
  const provider = new ethers.JsonRpcProvider(cfg.rpc, cfg.chainId, { staticNetwork: true });
  const wallet = new ethers.Wallet(privateKey, provider);
  if (wallet.address !== address) throw new Error("Deployer key/address mismatch");

  const balance = await provider.getBalance(wallet.address);
  console.log(`Network: ${network} (chainId ${cfg.chainId})`);
  console.log(`Deployer: ${wallet.address}`);
  console.log(`Balance: ${ethers.formatEther(balance)} BNB`);
  if (balance === 0n) throw new Error("Deployer has no funds on this network");

  const rollArt = artifact("AgentRollCall");
  let registryAddress = REAL_REGISTRY;
  let mockAddress = null;

  if (network === "testnet") {
    const mockArt = artifact("MockAgentId");
    const mock = await new ethers.ContractFactory(mockArt.abi, mockArt.bytecode, wallet).deploy();
    await mock.waitForDeployment();
    mockAddress = await mock.getAddress();
    registryAddress = mockAddress;
    console.log("MockAgentId deployed:", mockAddress, "tx:", mock.deploymentTransaction().hash);
  }

  const roll = await new ethers.ContractFactory(rollArt.abi, rollArt.bytecode, wallet).deploy(registryAddress);
  await roll.waitForDeployment();
  const rollAddress = await roll.getAddress();
  console.log("AgentRollCall deployed:", rollAddress, "tx:", roll.deploymentTransaction().hash);
  console.log("Registry used:", registryAddress);

  if (network === "testnet") {
    // Rehearsal: give the deployer a mock Agent ID and check in end-to-end.
    const mock = new ethers.Contract(mockAddress, artifact("MockAgentId").abi, wallet);
    await (await mock.giveAgentId(wallet.address, 424242)).wait();
    const tx = await roll.checkIn("testnet rehearsal — gm agents");
    await tx.wait();
    console.log("Test check-in tx:", tx.hash);
    const s = await roll.statsOf(wallet.address);
    console.log("Stats after check-in: total", s.totalCheckIns_.toString(), "| streak", s.currentStreak.toString(), "| tokenId", s.tokenId.toString(), "| shout:", s.shout);
    console.log("uniqueAgentCount:", (await roll.uniqueAgentCount()).toString());
  }

  const out = {
    network,
    chainId: cfg.chainId,
    deployer: wallet.address,
    registry: registryAddress,
    mockRegistry: mockAddress,
    agentRollCall: rollAddress,
    deployTx: roll.deploymentTransaction().hash,
    at: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(__dirname, "..", `deployment-${network}.json`), JSON.stringify(out, null, 2));
  console.log("Saved deployment-" + network + ".json");
})().catch((e) => {
  console.error("DEPLOY ERROR:", e.shortMessage || e.message);
  process.exit(1);
});
