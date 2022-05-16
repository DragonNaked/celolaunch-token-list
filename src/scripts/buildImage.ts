import fs from "fs";
import * as process from "process";
import {
  CELO_NETWORK_NAMES,
  getNetworkTokens,
  ICeloNetwork,
} from "../utils/rawTokens";

const buildTokenImage = async (network: ICeloNetwork) => {
  if (network === "test") {
    return;
  }
  const tokens = getNetworkTokens(network)
    .slice()
    .sort((a, b) =>
      a.address.toLowerCase().localeCompare(b.address.toLowerCase())
    );

  tokens.map((token) => {
    const dir = `${__dirname}/../../assets/`;

    const logoURI = `${dir}images/${token.symbol.replace("xV1", "")}.png`;
    if (fs.existsSync(logoURI)) {
      fs.copyFile(logoURI, `${dir}${token.address}.png`, (err) => {
        if (err) {
          console.log(`${token.symbol} ${token.address} does not exist`);
        }
      });
    }
  });
};

const main = async () => {
  console.log("Build token image...");
  await Promise.all(CELO_NETWORK_NAMES.map(buildTokenImage));
  console.log("Builded and files overwritten");
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
