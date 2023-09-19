import path from "path";

import fs from "fs";
import { config } from "./config";

export async function fetchLiveOrCached(): Promise<string> {
  const cachePath = config.CACHING_PATH ? path.resolve(config.CACHING_PATH) : null;

  if (cachePath) {
    if (fs.existsSync(cachePath)) {
      return fs.readFileSync(cachePath, "utf-8");
    }
  }

  const body = await fetch("https://www.e-tar.lt/rs/actualedition/TAR.BBE7D61A0416/kbsMIblEgh/");

  const html = await body.text();

  if (cachePath) {
    fs.writeFileSync(cachePath, html);
  }

  return html;
}
