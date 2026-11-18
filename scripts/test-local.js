// Local test: deploy MockAgentId + AgentRollCall to an in-process Ganache chain
// and exercise the check-in rules.
const fs = require("fs");
const path = require("path");
const ganache = require("ganache");
const { ethers } = require("ethers");

function artifact(name) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "..", "build", name + ".json"), "utf8"));
}

let failures = 0;
function check(label, cond) {
  console.log((cond ? "PASS" : "FAIL") + "  " + label);
  if (!cond) failures++;
}
async function expectRevert(label, promise, needle) {
  try {
    await promise;
    check(label + " (expected revert)", false);
  } catch (e) {
    const msg = (e.shortMessage || e.message || "").toString();
    check(label + " -> reverted (" + needle + ")", msg.includes(needle) || e.code === "CALL_EXCEPTION");
  }
}

(async () => {
  const provider = new ethers.BrowserProvider(ganache.provider());
  const signers = await provider.listAccounts();
  const deployer = signers[0];
  const alice = signers[1]; // will hold an Agent ID
  const bob = signers[2]; // no Agent ID
  const carol = signers[3]; // second holder

  const mockArt = artifact("MockAgentId");
  const rollArt = artifact("AgentRollCall");

  const mock = await new ethers.ContractFactory(mockArt.abi, mockArt.bytecode, deployer).deploy();
  await mock.waitForDeployment();
  const roll = await new ethers.ContractFactory(rollArt.abi, rollArt.bytecode, deployer).deploy(await mock.getAddress());
  await roll.waitForDeployment();
  console.log("MockAgentId:", await mock.getAddress());
  console.log("AgentRollCall:", await roll.getAddress());

  await (await mock.giveAgentId(alice.address, 777)).wait();
  await (await mock.giveAgentId(carol.address, 888)).wait();

  check("hasAgentId(alice) is true", (await roll.hasAgentId(alice.address)) === true);
  check("hasAgentId(bob) is false", (await roll.hasAgentId(bob.address)) === false);

  await expectRevert("non-holder check-in blocked", roll.connect(bob).checkIn("gm"), "Agent ID required");

  await (await roll.connect(alice).checkIn("first check-in, gm agents")).wait();
  let s = await roll.statsOf(alice.address);
  check("alice total = 1", s.totalCheckIns_ === 1n || s[0] === 1n);
  check("alice streak = 1", s.currentStreak === 1n || s[1] === 1n);
  check("alice shout stored", s.shout === "first check-in, gm agents" || s[5] === "first check-in, gm agents");
  check("alice tokenId recorded = 777", s.tokenId === 777n || s[4] === 777n);
  check("uniqueAgentCount = 1", (await roll.uniqueAgentCount()) === 1n);
  check("totalCheckIns = 1", (await roll.totalCheckIns()) === 1n);

  await expectRevert("second check-in same day blocked", roll.connect(alice).checkIn("again"), "Already checked in today");
  await expectRevert("shout over 140 chars blocked", roll.connect(carol).checkIn("x".repeat(141)), "Shout too long");

  // +1 day -> streak grows
  await provider.send("evm_increaseTime", [86400]);
  await provider.send("evm_mine", []);
  await (await roll.connect(alice).checkIn("day two")).wait();
  s = await roll.statsOf(alice.address);
  check("alice streak = 2 next day", s.currentStreak === 2n || s[1] === 2n);
  check("alice best streak = 2", s.bestStreak === 2n || s[2] === 2n);

  // +2 days (skip a day) -> streak resets
  await provider.send("evm_increaseTime", [2 * 86400]);
  await provider.send("evm_mine", []);
  await (await roll.connect(alice).checkIn("back again")).wait();
  s = await roll.statsOf(alice.address);
  check("alice streak resets to 1 after a skipped day", s.currentStreak === 1n || s[1] === 1n);
  check("alice best streak stays 2", s.bestStreak === 2n || s[2] === 2n);
  check("alice total = 3", s.totalCheckIns_ === 3n || s[0] === 3n);

  await (await roll.connect(carol).checkIn("carol reporting")).wait();
  check("uniqueAgentCount = 2", (await roll.uniqueAgentCount()) === 2n);
  check("agentAt(0) is alice", (await roll.agentAt(0)) === alice.address);
  check("agentAt(1) is carol", (await roll.agentAt(1)) === carol.address);
  check("totalCheckIns = 4", (await roll.totalCheckIns()) === 4n);

  console.log(failures === 0 ? "\nALL TESTS PASSED" : `\n${failures} TEST(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((e) => {
  console.error("TEST RUN ERROR:", e);
  process.exit(1);
});
