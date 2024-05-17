import path from "path";
import fs from "fs";

const skyriai: Record<string, string[]> = {};
const skyriuTitles: Record<string, string> = {};

export async function generateJson(rules: string): Promise<any> {
  const lines = rules
    .split("\n")
    .map((row) => row.trim())
    .filter(Boolean);

  let skyrius: string | null = null;
  let linesAfterSkyrius = 0;
  lines.forEach((line) => {
    if (line.includes("SKYRIUS")) {
      linesAfterSkyrius = 0;
      skyrius = line.replace(" SKYRIUS", "");
      skyriai[skyrius] = [];
      skyriuTitles[skyrius] = "";
    } else {
      linesAfterSkyrius += 1;
      if (linesAfterSkyrius === 1) {
        skyriuTitles[skyrius!] = line;
      } else {
        const split_first = line.split(" ")[0]!;
        const rule_match = split_first?.trim()?.match(/([0-9]+(\.[0-9]+)?)/);
        if (rule_match) {
          skyriai[skyrius!]!.push(line);
        }
      }
    }
  });

  const out: any = {};

  Object.entries(skyriai).forEach(([skyrius_key, value]) => {
    out[`${skyrius_key} ${skyriuTitles[skyrius_key]}`] = value;
  });

  const json = JSON.stringify(out, null, 2);
  const jsonPath = path.join("./keliu_eismo_taisykles_official.json");
  fs.writeFileSync(jsonPath, json);

  console.log(`Wrote ${jsonPath}`);

  return {};
}
