import { expect, test } from "vitest";
import { decompressOptions, parseOptions } from "./util";

test("blah", () => {
  const options =
    "eNpTcgoqdgQCQ9+sgvJQj5SwINdko6AwvyLfbD+30KywyBCDCu/IXMOggBADF5BCv6r8CmcQw8W13D8LiF2STSD85EoQ39fFsdwJzE8H8W2VAPwfHs8=";

  const opt = parseOptions(decompressOptions(options));
  console.log(opt);
});
