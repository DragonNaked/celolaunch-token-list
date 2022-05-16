import { TokenInfo } from "@uniswap/token-lists";
import alfajores from "../tokens/alfajores.json";
import baklava from "../tokens/baklava.json";
import mainnet from "../tokens/mainnet.json";
import test from "../tokens/test.json";

type IRawTokens = Pick<TokenInfo, "address" | "name" | "symbol"> &
  Partial<Pick<TokenInfo, "logoURI" | "decimals">> & {
    isExperimental?: boolean;
    logoFile?: string;
  };

type IRawTokensJson = readonly IRawTokens[];

export const CELO_NETWORK_NAMES = ["test", "alfajores", "baklava", "mainnet"];
export type ICeloNetwork = typeof CELO_NETWORK_NAMES[number];

const rawTokensJson: {
  [nextwork in ICeloNetwork]: [number, IRawTokensJson];
} = {
  test: [44780, test],
  alfajores: [44780, alfajores],
  baklava: [62320, baklava],
  mainnet: [42220, mainnet],
};

export const getNetworkTokens = (network: ICeloNetwork): IRawTokensJson =>
  rawTokensJson[network][1];

export const rawTokens: (IRawTokens & { chainId: number })[] = Object.values(
  rawTokensJson
).flatMap(([chainId, tokens]) =>
  tokens.map((token) => ({ ...token, chainId }))
);
