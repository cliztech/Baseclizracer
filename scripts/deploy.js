const fs = require('fs');

async function main() {
  const RaceTracker = await ethers.getContractFactory('RaceTracker');
  const tracker = await RaceTracker.deploy();
  await tracker.deployed();
  console.log('RaceTracker deployed to:', tracker.address);
  fs.writeFileSync(
    'config.js',
    `var CONFIG = { contractAddress: '${tracker.address}' };\n`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
