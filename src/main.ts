import path from "path";
import fs from "fs";
import { convert } from "html-to-text";
import { fetchLiveOrCached } from "./parse";

async function main(): Promise<void> {
  const html = await fetchLiveOrCached();

  // strip html tags and convert to text
  const root = convert(html, {
    wordwrap: 13000, // just a large number so lines aren't split
  });

  const taisykles = root
    .split("––––––––––––––––––––")[0]! // no kelio zenklai
    .split("KELIŲ EISMO TAISYKLĖS")[1]!; // no header

  const ketPath = path.join("./keliu_eismo_taisykles_official.txt");

  fs.writeFileSync(ketPath, `KELIŲ EISMO TAISYKLĖS${taisykles}}`);
  console.log(`Wrote ${ketPath}`);

  generateJson(taisykles);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

async function generateJson(rules: string): Promise<any> {
  const lines = rules
    .split("\n")
    .map((row) => row.trim())
    .filter(Boolean);

  // console.log(lines);

  let skyrius: string | null = null;
  let rule: number | null = null;
  const skyriai: Record<string, any> = {};

  lines.forEach((line) => {
    if (line.includes("SKYRIUS")) {
      skyrius = line.replace(" SKYRIUS", "");
      skyriai[skyrius] = {};
    } else {
      // console.log(line);
      const split_first = line.split(" ")[0]!;
      // matches float regex
      const rule_match = split_first?.trim()?.match(/([0-9]+(\.[0-9]+)?)/);
      // console.log({ split_first, line, rule_match });

      if (rule_match) {
        rule = parseFloat(rule_match[0]);
        // console.log({ rule });
        skyriai[skyrius!][rule!] = [];
        line = line.replace(split_first, "").trim();
      }

      // console.log({ skyrius, rule });
      if (skyriai[skyrius!][rule!]) {
        skyriai[skyrius!][rule!].push(line);
      } else {
        skyriai[skyrius!]["title"] = line;
      }
    }
  });

  const out: any = {};

  Object.entries(skyriai).forEach(([skyrius_key, value]) => {
    out[`${skyrius_key} ${value["title"]}`] = Object.entries(value)
      .filter(([k]) => k != "title")
      .map(([ruleNo, value]) => `${parseFloat(ruleNo).toString()}. ${value}`);
  });

  const json = JSON.stringify(out, null, 2);
  const jsonPath = path.join("./keliu_eismo_taisykles_official.json");
  fs.writeFileSync(jsonPath, json);

  return {};
}
