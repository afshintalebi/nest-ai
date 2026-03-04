import * as fs from "fs-extra";
import * as path from "path";
import Handlebars from "handlebars";
import { EntitySchema } from "./ai";
import { select } from "@inquirer/prompts";

export async function generateCode(schema: EntitySchema): Promise<void> {
  console.log(`\n⚙️  Generating files for: ${schema.className}...`);

  const templatesDir = path.join(process.cwd(), "templates");
  const outputBaseDir = path.join(
    process.cwd(),
    "src",
    schema.moduleType,
    schema.camelCaseName,
  );

  const configPath = path.join(templatesDir, "structure.json");
  const configRaw = await fs.readFile(configPath, "utf-8");
  const config = JSON.parse(configRaw);

  // memory flag to remember if the user wants to overwrite everything
  let overwriteAll = false;

  for (const file of config.files) {
    const templatePath = path.join(templatesDir, file.template);

    const pathCompiler = Handlebars.compile(file.output);
    const dynamicFileName = pathCompiler(schema);
    const outputPath = path.join(outputBaseDir, dynamicFileName);

    // track if we should skip writing THIS specific file
    let skipThisFile = false;

    if (!overwriteAll && (await fs.pathExists(outputPath))) {
      console.log(`\n⚠️  Conflict: ${dynamicFileName} already exists.`);

      const action = await select({
        message: "How would you like to proceed?",
        choices: [
          { name: "📄 Overwrite THIS file only", value: "overwrite_one" },
          {
            name: "⏭️  Skip THIS file (Keep existing code)",
            value: "skip_one",
          },
          {
            name: "💣 Overwrite ALL conflicting files",
            value: "overwrite_all",
          },
          { name: "🛑 Abort generation completely", value: "abort" },
        ],
      });

      if (action === "abort") {
        console.log(`\n🛑 Process aborted. No further files were modified.\n`);
        process.exit(0);
      } else if (action === "overwrite_all") {
        overwriteAll = true;
        console.log(`\n💣 Overwriting remaining existing files...`);
      } else if (action === "skip_one") {
        skipThisFile = true; // Mark this file to be skipped
      }
    }

    // if the user chose to skip, jump to the next file in the loop immediately!
    if (skipThisFile) {
      console.log(`   ⏭️  Skipped: ${dynamicFileName}`);
      continue;
    }

    try {
      // compile the actual file content
      const templateContent = await fs.readFile(templatePath, "utf-8");
      const contentCompiler = Handlebars.compile(templateContent);
      const resultingCode = contentCompiler(schema);

      // write the file to disk
      await fs.outputFile(outputPath, resultingCode);

      console.log(`   ✅ Created/Updated: ${dynamicFileName}`);
    } catch (error) {
      console.error(`   ❌ Failed to generate from ${file.template}:`, error);
    }
  }

  console.log(`\n🚀 Successfully finished generating module!`);
}
