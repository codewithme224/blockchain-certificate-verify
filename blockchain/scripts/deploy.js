const hre = require("hardhat");

async function main() {
  console.log("Deploying CertificateVerifier contract...");

  // Get the contract factory
  const CertificateVerifier = await hre.ethers.getContractFactory("CertificateVerifier");

  // Deploy the contract
  const certificateVerifier = await CertificateVerifier.deploy();
  await certificateVerifier.waitForDeployment();

  const address = await certificateVerifier.getAddress();
  console.log("CertificateVerifier deployed to:", address);

  // Save the contract address and ABI
  const fs = require("fs");
  const contractsDir = __dirname + "/../contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  // Save address
  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ CertificateVerifier: address }, undefined, 2)
  );

  // Save ABI
  const artifact = artifacts.readArtifactSync("CertificateVerifier");
  fs.writeFileSync(
    contractsDir + "/CertificateVerifier.json",
    JSON.stringify(artifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 