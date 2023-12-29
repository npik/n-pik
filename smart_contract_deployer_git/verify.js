const hre = require("hardhat");
const meta = require('./artifacts/contracts/ERC20Token.sol/ERC20Token.json');

async function main() {
  await hre.run("verify:verify", {
    address: "0xcc32f4d3f219Ac0eD552D086EF03CEc9B8437BDF", // 컨트랙트 주소
    constructorArguments: [
      "DOHAN publish test",
      "DOHAN2",
      "1000000000000",
    ],
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
