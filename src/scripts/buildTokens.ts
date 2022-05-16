import { TokenInfo, TokenList } from "@uniswap/token-lists";
import fs from "fs/promises";
import * as process from "process";
import packageJSON from "../../package.json";
import { requireOrThrow } from "../utils/helper";
import { rawTokens } from "../utils/rawTokens";

const version = packageJSON.version.split(".");

const LOGO_URI_BASE =
  "https://raw.githubusercontent.com/dragonnaked/celolaunch-token-list/main";

const makeTokenList = (
  previousTokenList: TokenList | null,
  tokens: TokenInfo[]
): TokenList => {
  let timestamp: string = new Date().toISOString();
  if (process.env.CI) {
    if (!previousTokenList) {
      throw new Error("Token list not found");
    }
    timestamp = previousTokenList.timestamp;
  }
  return {
    name: previousTokenList?.name ?? "Unknown List",
    logoURI: `${LOGO_URI_BASE}/logo.svg`,
    keywords: ["celo", "celolaunch", "defi"],
    timestamp,
    tokens,
    version: {
      major: parseInt(version[0]),
      minor: parseInt(version[1]),
      patch: parseInt(version[2]),
    },
  };
};

const main = async () => {
  const allTokens = await Promise.all(
    rawTokens.map(async ({ logoURI: elLogoURI, logoFile, ...el }) => {
      const logoURI =
        elLogoURI ||
        (logoFile ? `${LOGO_URI_BASE}/assets/${logoFile}` : null) ||
        `${LOGO_URI_BASE}/assets/${el.address}.png`;

      console.log(logoURI);
      // Validate
      if (logoURI.startsWith(LOGO_URI_BASE)) {
        const logoPath = `${__dirname}/../../${logoURI.substring(
          LOGO_URI_BASE.length
        )}`;
        const stat = await fs.stat(logoPath);
        if (!stat.isFile()) {
          throw new Error(
            `logo for ${el.address} on ${el.chainId} does not exist`
          );
        }
      }
      return {
        ...el,
        decimals: el.decimals || 18,
        logoURI,
        isExperimental: el.isExperimental,
      };
    })
  );

  const [mainTokenListTokens, experimentalTokenListTokens] = allTokens.reduce(
    ([mainTokens, experimentalTokens], { isExperimental, ...token }) => {
      if (isExperimental !== true && token.chainId === 42220) {
        return [
          [...mainTokens, token],
          [...experimentalTokens, token],
        ];
      } else {
        return [mainTokens, [...experimentalTokens, token]];
      }
    },
    [[] as TokenInfo[], [] as TokenInfo[]]
  );

  const previousTokenList = requireOrThrow(
    __dirname,
    "../../celolaunch.token-list.json"
  );
  const previousExperimentalTokenList = requireOrThrow(
    __dirname,
    "../../celolaunch-experimental.token-list.json"
  );

  const tokenList = makeTokenList(previousTokenList, mainTokenListTokens);
  const experimentalTokenList = makeTokenList(
    previousExperimentalTokenList,
    experimentalTokenListTokens
  );

  await fs.writeFile(
    __dirname + "/../../celolaunch.token-list.json",
    JSON.stringify(tokenList, null, 2)
  );

  await fs.writeFile(
    __dirname + "/../../celolaunch-experimental.token-list.json",
    JSON.stringify(experimentalTokenList, null, 2)
  );
};

main().catch((err) => {
  console.error("Error", err);
  process.exit(1);
});
