import path from "path";
import fs from "fs";
import { convert } from "html-to-text";
import { fetchLiveOrCached } from "./parse";
import { generateJson } from "./generateJson";

async function main(): Promise<void> {
  const html = await fetchLiveOrCached();

  // strip html tags and convert to text
  const root = convert(html, {
    wordwrap: 13000, // just a large number so lines aren't split
    selectors: [{ selector: "sup", format: "inlineTag" }],
  });

  const taisykles = root
    .split("––––––––––––––––––––")[0]! // no kelio zenklai
    .split("KELIŲ EISMO TAISYKLĖS")[1]!; // no header

  const ketPath = path.join("./keliu_eismo_taisykles_official.txt");

  fs.writeFileSync(ketPath, `KELIŲ EISMO TAISYKLĖS${taisykles}}`);
  console.log(`Wrote ${ketPath}`);

  await generateJson(taisykles);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
