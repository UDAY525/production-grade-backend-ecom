import fs from "fs/promises";
import path from "path";

// 1. Define the target directory path where you want the files to go
const TARGET_DIR = path.join(
  process.cwd(),
  "src",
  "modules",
  "products",
  "category",
);

// 2. Define the list of files you want to generate
const FILES_TO_CREATE = [
  "category.controller.ts",
  "category.service.ts",
  "category.repository.ts",
  "category.types.ts",
  "category.validation.ts",
];

async function generateScaffold() {
  try {
    // Ensure the target folder exists (like 'mkdir -p')
    await fs.mkdir(TARGET_DIR, { recursive: true });
    console.log(`📁 Target directory verified: ${TARGET_DIR}\n`);

    for (const filename of FILES_TO_CREATE) {
      const filePath = path.join(TARGET_DIR, filename);

      try {
        // Check if the file already exists to prevent accidentally wiping code
        await fs.access(filePath);
        console.log(`⚠️  Skipped: ${filename} (Already exists)`);
      } catch {
        // If fs.access fails, the file does not exist, so we create it blank
        await fs.writeFile(filePath, "", "utf-8");
        console.log(`✅ Created: ${filename}`);
      }
    }

    console.log("\n🚀 All files processed successfully!");
  } catch (error) {
    console.error("❌ Failed to create files:", error);
    process.exit(1);
  }
}

generateScaffold();
