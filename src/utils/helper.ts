import { TokenList } from "@uniswap/token-lists";
import * as path from "path";

export class requireError extends Error {
  code?: string;
}

export const requireOrThrow = (
  dirname: string,
  p: string
): TokenList | null => {
  if (p.startsWith(`.${path.sep}`) || p.startsWith(`..${path.sep}`)) {
    p = path.resolve(dirname, p);
  }

  try {
    return require(p);
  } catch (err: unknown) {
    if (
      (err as requireError).code === "MODULE_NOT_FOUND" &&
      ~(err as requireError).message.indexOf(p)
    ) {
      return null;
    }
    throw err;
  }
};
