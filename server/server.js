import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";

dotenv.config();

const execFileAsync = promisify(execFile);

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3001;

// Hugging Face OpenAI-compatible router
const MODEL = "Qwen/Qwen3-4B-Instruct-2507:nscale";


// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function parseRepoUrl(url) {
  const match = url.match(
    /github\.com\/([^/]+)\/([^/#?]+)/
  );

  if (!match) {
    throw new Error("Invalid GitHub repository URL");
  }

  return {
    owner: match[1],
    repo: match[2].replace(".git", "")
  };
}


// ─────────────────────────────────────────────
// Clone repository
// ─────────────────────────────────────────────

async function cloneRepository(owner, repo) {
  const tempDir = await fs.mkdtemp(
    path.join(os.tmpdir(), "patchpath-")
  );

  const repoUrl =
    `https://github.com/${owner}/${repo}.git`;

  console.log(`📥 Cloning ${repoUrl}`);

  try {
    await execFileAsync(
      "git",
      [
        "clone",
        "--depth",
        "1",
        repoUrl,
        tempDir
      ],
      {
        timeout: 120000
      }
    );
  } catch (error) {
    await fs.rm(tempDir, {
      recursive: true,
      force: true
    });

    throw new Error(
      `Could not clone repository: ${error.message}`
    );
  }

  return tempDir;
}


// ─────────────────────────────────────────────
// Find repository files
// ─────────────────────────────────────────────

async function getFiles(dir, baseDir = dir) {
  const entries = await fs.readdir(dir, {
    withFileTypes: true
  });

  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(
      dir,
      entry.name
    );

    // Ignore dependency/generated folders
    if (
      entry.name === ".git" ||
      entry.name === "node_modules" ||
      entry.name === "dist" ||
      entry.name === "build" ||
      entry.name === "__pycache__" ||
      entry.name === ".next" ||
      entry.name === "coverage" ||
      entry.name === ".venv" ||
      entry.name === "venv"
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      const nestedFiles =
        await getFiles(
          fullPath,
          baseDir
        );

      files.push(...nestedFiles);
    } else {
      try {
        const stat =
          await fs.stat(fullPath);

        // Ignore files larger than 50 KB
        if (stat.size > 50000) {
          continue;
        }

        files.push({
          path: path
            .relative(
              baseDir,
              fullPath
            )
            .replaceAll("\\", "\\"),

          fullPath,

          size: stat.size
        });
      } catch {
        // Ignore unreadable files
      }
    }
  }

  return files;
}


// ─────────────────────────────────────────────
// Read file
// ─────────────────────────────────────────────

async function readFileContent(file) {
  try {
    return await fs.readFile(
      file.fullPath,
      "utf8"
    );
  } catch {
    return null;
  }
}


// ─────────────────────────────────────────────
// Health
// ─────────────────────────────────────────────

app.get(
  "/api/health",
  (req, res) => {
    res.json({
      status: "ok",
      app: "PatchPath",
      model: MODEL
    });
  }
);


// ─────────────────────────────────────────────
// Analyze repository + issue
// ─────────────────────────────────────────────

app.post(
  "/api/analyze",
  async (req, res) => {
    let repoDir = null;

    try {
      const {
        repoUrl,
        issue
      } = req.body;


      // Validate input
      if (!repoUrl || !issue) {
        return res.status(400).json({
          error:
            "Repository URL and issue are required"
        });
      }


      // ───────────────────────────────────────
      // 1. Parse repository URL
      // ───────────────────────────────────────

      const {
        owner,
        repo
      } = parseRepoUrl(repoUrl);


      console.log("");
      console.log(
        `🔍 Investigating ${owner}/${repo}`
      );

      console.log(
        `📌 Issue: ${issue}`
      );


      // ───────────────────────────────────────
      // 2. Clone repository
      // ───────────────────────────────────────

      repoDir =
        await cloneRepository(
          owner,
          repo
        );


      console.log(
        `📁 Repository cloned to ${repoDir}`
      );


      // ───────────────────────────────────────
      // 3. Discover files
      // ───────────────────────────────────────

      const allFiles =
        await getFiles(repoDir);


      console.log(
        `📂 Found ${allFiles.length} files`
      );


      // ───────────────────────────────────────
      // 4. Extract issue keywords
      // ───────────────────────────────────────

      const issueWords =
        issue
          .toLowerCase()
          .replace(
            /[^a-z0-9_.\-/]/g,
            " "
          )
          .split(/\s+/)
          .filter(
            word => word.length > 2
          );


      console.log(
        `🔎 Issue keywords: ${issueWords.join(", ")}`
      );


      // ───────────────────────────────────────
      // 5. Score files
      // ───────────────────────────────────────

      const scored =
        allFiles.map(file => {

          const filePath =
            file.path.toLowerCase();

          let score = 0;


          // Issue keywords
          for (const word of issueWords) {
            if (
              filePath.includes(word)
            ) {
              score += 5;
            }
          }


          // Important project files
          if (
            filePath.includes("readme")
          ) {
            score += 2;
          }

          if (
            filePath.includes("package.json")
          ) {
            score += 2;
          }

          if (
            filePath.includes("pyproject")
          ) {
            score += 2;
          }

          if (
            filePath.includes("setup.py")
          ) {
            score += 2;
          }

          if (
            filePath.includes("contributing")
          ) {
            score += 2;
          }


          // Source code
          if (
            filePath.endsWith(".js") ||
            filePath.endsWith(".jsx") ||
            filePath.endsWith(".ts") ||
            filePath.endsWith(".tsx") ||
            filePath.endsWith(".py") ||
            filePath.endsWith(".java") ||
            filePath.endsWith(".go") ||
            filePath.endsWith(".rs")
          ) {
            score += 1;
          }


          // Tests
          if (
            filePath.includes("test") ||
            filePath.includes("spec")
          ) {
            score += 2;
          }


          return {
            ...file,
            score
          };

        });


      // ───────────────────────────────────────
      // 6. Select relevant files
      // ───────────────────────────────────────

      const candidates =
        scored
          .sort(
            (a, b) =>
              b.score - a.score
          )
          // Reduced from 15 → 8
          .slice(0, 8);


      console.log("");
      console.log(
        "🎯 Selected files:"
      );


      for (const file of candidates) {
        console.log(
          `   ${file.path} [score: ${file.score}]`
        );
      }


      // ───────────────────────────────────────
      // 7. Read candidate files
      // ───────────────────────────────────────

      const fileContents = [];


      for (const file of candidates) {

        const content =
          await readFileContent(file);


        if (content !== null) {

          fileContents.push({
            path: file.path,

            // Limit each file to 6 KB
            content:
              content.slice(
                0,
                6000
              )
          });

        }

      }


      console.log(
        `📖 Read ${fileContents.length} files`
      );


      // ───────────────────────────────────────
      // 8. Build evidence context
      // ───────────────────────────────────────

      const context =
        fileContents
          .map(
            file =>
              `===== ${file.path} =====\n${file.content}`
          )
          .join("\n\n");


      // ───────────────────────────────────────
      // 9. PatchPath prompt
      // ───────────────────────────────────────

      const prompt = `You are PatchPath, an open-source contribution intelligence engine.

Your job is NOT to write the code.

Your job is to investigate an existing repository and produce a codebase-specific implementation blueprint for the issue.

Repository:
${owner}/${repo}

Issue:
${issue}

Relevant repository files discovered by PatchPath:

${context}

Analyze the ACTUAL implementation patterns in these files.

Return ONLY valid JSON with exactly this structure:

{
  "summary": "...",
  "change_surface": [
    {
      "file": "...",
      "action": "MODIFY | ADD | DELETE",
      "why": "...",
      "evidence": "...",
      "confidence": "HIGH | MEDIUM | LOW"
    }
  ],
  "implementation_steps": [
    "...",
    "..."
  ],
  "existing_patterns": [
    "..."
  ],
  "test_plan": [
    "..."
  ],
  "risks": [
    "..."
  ]
}

Rules:

- Reference actual files from the supplied repository context.
- Do not invent existing files.
- If a new file is necessary, mark its action as ADD.
- Prefer the repository's existing architecture and patterns.
- Explain WHY each important file matters.
- Use concrete evidence from the supplied code.
- Make the implementation sequence practical.
- Focus on helping a human contributor implement the issue.
- Do not write the implementation itself.
- Do not return markdown.
- Return JSON only.
`;


      // ───────────────────────────────────────
      // 10. Call Hugging Face Router
      // ───────────────────────────────────────

      console.log("");

      console.log(
        "🤖 Sending repository evidence to Qwen..."
      );


      const hfResponse =
        await fetch(
          "https://router.huggingface.co/v1/chat/completions",
          {
            method: "POST",

            headers: {
              "Authorization":
                `Bearer ${process.env.HF_TOKEN}`,

              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              model: MODEL,

              messages: [
                {
                  role: "system",

                  content:
                    "You are PatchPath, an expert open-source contribution investigator. Return strict JSON when requested."
                },

                {
                  role: "user",

                  content: prompt
                }
              ],

              // Reduced output size
              max_tokens: 1200,

              temperature: 0,

              stream: false,

              // Disable Qwen thinking for faster MVP responses
              chat_template_kwargs: {
                enable_thinking: false
              }
            })
          }
        );


      // ───────────────────────────────────────
      // 11. Handle Hugging Face errors
      // ───────────────────────────────────────

      if (!hfResponse.ok) {

        const errorText =
          await hfResponse.text();

        throw new Error(
          `Hugging Face error ${hfResponse.status}: ${errorText}`
        );
      }


      const response =
        await hfResponse.json();


      console.log(
        "✅ Qwen response received"
      );


      // ───────────────────────────────────────
      // 12. Extract model response
      // ───────────────────────────────────────

      const raw =
        response
          ?.choices?.[0]
          ?.message
          ?.content;


      if (!raw) {

        console.error(
          "Unexpected Hugging Face response:",
          JSON.stringify(
            response,
            null,
            2
          )
        );

        throw new Error(
          "Qwen returned an empty response"
        );
      }


      // ───────────────────────────────────────
      // 13. Extract JSON
      // ───────────────────────────────────────

      const start =
        raw.indexOf("{");

      const end =
        raw.lastIndexOf("}");


      if (
        start === -1 ||
        end === -1
      ) {

        console.error(
          "Raw Qwen response:",
          raw
        );

        throw new Error(
          "Qwen did not return valid JSON"
        );
      }


      const jsonText =
        raw.slice(
          start,
          end + 1
        );


      let blueprint;


      try {

        blueprint =
          JSON.parse(
            jsonText
          );

      } catch {

        console.error(
          "Raw Qwen response:",
          raw
        );

        throw new Error(
          "Could not parse Qwen JSON response"
        );
      }


      // ───────────────────────────────────────
      // 14. Return PatchPath result
      // ───────────────────────────────────────

      res.json({

        repository:
          `${owner}/${repo}`,

        branch:
          "default",

        filesAnalyzed:
          fileContents.map(
            file => file.path
          ),

        blueprint

      });


      console.log("");

      console.log(
        "✅ PATCHPATH ANALYSIS COMPLETE"
      );

      console.log("");

    } catch (error) {

      console.error("");

      console.error(
        "❌ PATCHPATH ERROR:"
      );

      console.error(
        error.message
      );


      res.status(500).json({
        error:
          error.message
      });

    } finally {

      // ─────────────────────────────────────
      // Cleanup temporary repository
      // ─────────────────────────────────────

      if (repoDir) {

        try {

          await fs.rm(
            repoDir,
            {
              recursive: true,
              force: true
            }
          );


          console.log(
            "🧹 Temporary repository removed"
          );

        } catch {
          // Ignore cleanup errors
        }

      }

    }

  }
);


// ─────────────────────────────────────────────
// Start server
// ─────────────────────────────────────────────

app.listen(
  PORT,
  () => {

    console.log("");

    console.log(
      "╔══════════════════════════════════╗"
    );

    console.log(
      "║          PATCHPATH API           ║"
    );

    console.log(
      "╠══════════════════════════════════╣"
    );

    console.log(
      `║ http://localhost:${PORT}          ║`
    );

    console.log(
      `║ Model: ${MODEL} ║`
    );

    console.log(
      "╚══════════════════════════════════╝"
    );

    console.log("");

  }
);