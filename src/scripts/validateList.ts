import { TokenList } from "@uniswap/token-lists";
import schema from "@uniswap/token-lists/src/tokenlist.schema.json";
import Ajv, { Schema } from "ajv";
import addFormats from "ajv-formats";
import deepmerge from "deepmerge";
import { requireOrThrow } from "../utils/helper";

const main = async () => {
  const tokenList: TokenList | null = await requireOrThrow(
    __dirname,
    `../../${process.argv[2]}`
  );

  if (!tokenList) {
    throw new Error("Token list not found");
  }

  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);

  // Update JSON schema for latest version
  const newSchema: Schema = deepmerge(schema, {
    definitions: {
      TokenInfo: {
        properties: {
          name: {
            pattern: "^[ \\w.'+\\-%/À-ÖØ-öø-ÿ:]+$",
          },
          tags: {
            maxItems: schema.definitions.TokenInfo.properties.tags.maxItems,
          },
        },
      },
    },
  });
  delete newSchema.definitions.TokenInfo.properties.tags.maxLength;

  const tokenListValidator = ajv.compile(newSchema);

  const validateList = (list: TokenList) => {
    const name = list.name;
    if (!tokenListValidator(list)) {
      console.error(
        "invalid default list",
        JSON.stringify(tokenListValidator.errors, null, 2)
      );
      throw new Error("could not validate list: " + name);
    }
  };

  validateList(tokenList);
};

main().catch((err) => {
  console.error("Error", err);
  process.exit(1);
});
