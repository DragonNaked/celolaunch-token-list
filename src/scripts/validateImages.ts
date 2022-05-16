import { TokenInfo } from "@uniswap/token-lists";
import fs from "fs";
import probe from "probe-image-size";
import { requireOrThrow } from "../utils/helper";

function isSquare(token: { symbol: string }, data: probe.ProbeResult) {
  if (data.width !== data.height) {
    console.error(
      "🟨",
      token.symbol,
      "height must be same as width",
      "height:",
      data.height,
      "width:",
      data.width
    );
    return false;
  }
  return true;
}

function checkSize(
  side: "height" | "width",
  token: { symbol: string },
  data: probe.ProbeResult
) {
  if (data.type == "svg") {
    return true;
  }
  if ((data[side] || 0) > 200) {
    console.error(
      "⚠️",
      token.symbol,
      side,
      "is",
      data[side],
      "should be less than or equal to 200"
    );
    return false;
  }
  return true;
}

function checkType(token: { symbol: string }, data: probe.ProbeResult) {
  if ("png" !== data.type && "svg" !== data.type) {
    console.error(
      "⛔️",
      token.symbol,
      "is",
      data.type,
      ". Tokens must be png or svg."
    );
    return false;
  }
  return true;
}

const main = async () => {
  const tokenList = await requireOrThrow(__dirname, `../../${process.argv[2]}`);
  if (tokenList === null) {
    console.log("No token list found");
    process.exit(1);
  }

  const NEED_RESIZING: string[] = [];
  tokenList.tokens.forEach((token: TokenInfo) => {
    const relative = token.logoURI?.replace(
      "https://raw.githubusercontent.com/dragonnaked/celolaunch-token-list/main/",
      "./"
    );

    if (relative) {
      const image = fs.readFileSync(relative);
      const data = probe.sync(image);
      let noErrors = true;
      if (data) {
        const validHeight = checkSize("height", token, data);
        const validWidth = checkSize("width", token, data);
        const validProportions = isSquare(token, data);
        const validType = checkType(token, data);
        noErrors = validHeight && validWidth && validType && validProportions;
      }
      if (noErrors) {
        console.log("✅", token.name);
      } else {
        NEED_RESIZING.push(relative);
      }
    }
  });

  if (NEED_RESIZING.length > 0) {
    console.info("NEED RESIZING");
    NEED_RESIZING.forEach((image) => console.info(image));
  } else {
    console.info("complete 🚀");
  }
};

main().catch((err) => {
  console.error("Error", err);
  process.exit(1);
});
