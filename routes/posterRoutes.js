import express from "express";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================
// POSTER DIRECTORY
// =========================

const posterDirectory = path.join(
  __dirname,
  "../uploads/posters"
);

if (!fs.existsSync(posterDirectory)) {
  fs.mkdirSync(posterDirectory, {
    recursive: true,
  });
}

// =========================
// ESCAPE XML
// =========================

const escapeXml = (text = "") => {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

// =========================
// TEXT WRAPPING
// =========================

const wrapText = (
  text,
  maxChars = 24,
  maxLines = 3
) => {
  const words = String(text || "")
    .trim()
    .split(/\s+/);

  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine
      ? `${currentLine} ${word}`
      : word;

    if (testLine.length <= maxChars) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }

      currentLine = word;
    }

    if (lines.length === maxLines - 1) {
      break;
    }
  }

  if (
    currentLine &&
    lines.length < maxLines
  ) {
    const usedWords = lines
      .join(" ")
      .split(/\s+/)
      .filter(Boolean).length;

    const remainingWords =
      words.slice(usedWords);

    const remainingText =
      remainingWords.join(" ");

    if (remainingText.length > maxChars) {
      currentLine =
        `${remainingText.slice(
          0,
          maxChars - 3
        )}...`;
    } else {
      currentLine = remainingText;
    }

    lines.push(currentLine);
  }

  return lines
    .filter(Boolean)
    .slice(0, maxLines);
};

// =========================
// CATEGORY STYLE
// =========================

const getPosterStyle = (category = "") => {
  const value =
    category.toLowerCase();

  if (
    value.includes("tech") ||
    value.includes("ai") ||
    value.includes("coding")
  ) {
    return {
      background1: "#020617",
      background2: "#1d4ed8",
      accent: "#60a5fa",
      label: "TECHNOLOGY EVENT",
    };
  }

  if (
    value.includes("sport") ||
    value.includes("cricket") ||
    value.includes("kabaddi")
  ) {
    return {
      background1: "#052e16",
      background2: "#16a34a",
      accent: "#86efac",
      label: "SPORTS EVENT",
    };
  }

  if (
    value.includes("cultural") ||
    value.includes("music") ||
    value.includes("dance")
  ) {
    return {
      background1: "#4a044e",
      background2: "#db2777",
      accent: "#f9a8d4",
      label: "CULTURAL EVENT",
    };
  }

  if (
    value.includes("workshop")
  ) {
    return {
      background1: "#172554",
      background2: "#7c3aed",
      accent: "#c4b5fd",
      label: "WORKSHOP",
    };
  }

  if (
    value.includes("seminar") ||
    value.includes("conference")
  ) {
    return {
      background1: "#111827",
      background2: "#475569",
      accent: "#cbd5e1",
      label: "SEMINAR",
    };
  }

  return {
    background1: "#0f172a",
    background2: "#2563eb",
    accent: "#93c5fd",
    label: "COLLEGE EVENT",
  };
};

// =========================
// GENERATE POSTER
// =========================

router.post(
  "/generate",
   adminAuthMiddleware,
  async (req, res) => {
    try {
      const {
        name,
        category,
        date,
        location,
        description,
      } = req.body;

      if (
        !name ||
        !date ||
        !location
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Event name, date and location are required.",
          });
      }

      console.log(
        "🎨 Generating free poster for:",
        name
      );

      const style =
        getPosterStyle(category);

      // =========================
      // FORMAT DATE
      // =========================

      const parsedDate =
        new Date(
          `${date}T00:00:00`
        );

      const formattedDate =
        Number.isNaN(
          parsedDate.getTime()
        )
          ? date
          : parsedDate.toLocaleDateString(
              "en-IN",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
              }
            );

      // =========================
      // WRAP CONTENT
      // =========================

      const titleLines =
        wrapText(
          name.toUpperCase(),
          20,
          3
        );

      const descriptionLines =
        wrapText(
          description ||
            "Join us for an exciting college event.",
          52,
          3
        );

      const safeLocation =
        escapeXml(location);

      const safeDate =
        escapeXml(
          formattedDate
        );

      // =========================
      // TITLE TSPANS
      // =========================

      const titleSvg =
        titleLines
          .map(
            (line, index) => `
              <tspan
                x="80"
                dy="${
                  index === 0
                    ? 0
                    : 88
                }"
              >
                ${escapeXml(line)}
              </tspan>
            `
          )
          .join("");

      // =========================
      // DESCRIPTION TSPANS
      // =========================

      const descriptionSvg =
        descriptionLines
          .map(
            (line, index) => `
              <tspan
                x="80"
                dy="${
                  index === 0
                    ? 0
                    : 44
                }"
              >
                ${escapeXml(line)}
              </tspan>
            `
          )
          .join("");

      // =========================
      // SVG POSTER
      // =========================

      const svg = `
      <svg
        width="1024"
        height="1280"
        xmlns="http://www.w3.org/2000/svg"
      >

        <defs>

          <linearGradient
            id="background"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >

            <stop
              offset="0%"
              stop-color="${style.background1}"
            />

            <stop
              offset="100%"
              stop-color="${style.background2}"
            />

          </linearGradient>

        </defs>

        <!-- BACKGROUND -->

        <rect
          width="1024"
          height="1280"
          fill="url(#background)"
        />

        <!-- DECORATIVE SHAPES -->

        <circle
          cx="900"
          cy="120"
          r="260"
          fill="${style.accent}"
          opacity="0.10"
        />

        <circle
          cx="100"
          cy="1150"
          r="300"
          fill="${style.accent}"
          opacity="0.08"
        />

        <circle
          cx="850"
          cy="1050"
          r="130"
          fill="${style.accent}"
          opacity="0.08"
        />

        <rect
          x="760"
          y="300"
          width="220"
          height="220"
          rx="40"
          fill="${style.accent}"
          opacity="0.05"
          transform="rotate(15 870 410)"
        />

        <!-- BRAND -->

        <text
          x="80"
          y="100"
          fill="white"
          font-size="38"
          font-weight="700"
          font-family="Arial, sans-serif"
        >
          EVENTIFY
        </text>

        <!-- CATEGORY BADGE -->

        <rect
          x="80"
          y="155"
          width="400"
          height="65"
          rx="32"
          fill="${style.accent}"
          opacity="0.20"
        />

        <text
          x="110"
          y="198"
          fill="white"
          font-size="26"
          font-weight="700"
          font-family="Arial, sans-serif"
        >
          ${escapeXml(style.label)}
        </text>

        <!-- EVENT TITLE -->

        <text
          x="80"
          y="340"
          fill="white"
          font-size="74"
          font-weight="800"
          font-family="Arial, sans-serif"
        >
          ${titleSvg}
        </text>

        <!-- DESCRIPTION -->

        <text
          x="80"
          y="650"
          fill="#e2e8f0"
          font-size="31"
          font-weight="400"
          font-family="Arial, sans-serif"
        >
          ${descriptionSvg}
        </text>

        <!-- DIVIDER -->

        <rect
          x="80"
          y="820"
          width="864"
          height="2"
          fill="white"
          opacity="0.25"
        />

        <!-- DATE LABEL -->

        <text
          x="80"
          y="900"
          fill="${style.accent}"
          font-size="26"
          font-weight="700"
          font-family="Arial, sans-serif"
        >
          DATE
        </text>

        <!-- DATE VALUE -->

        <text
          x="80"
          y="955"
          fill="white"
          font-size="42"
          font-weight="700"
          font-family="Arial, sans-serif"
        >
          ${safeDate}
        </text>

        <!-- LOCATION LABEL -->

        <text
          x="80"
          y="1045"
          fill="${style.accent}"
          font-size="26"
          font-weight="700"
          font-family="Arial, sans-serif"
        >
          LOCATION
        </text>

        <!-- LOCATION VALUE -->

        <text
          x="80"
          y="1100"
          fill="white"
          font-size="40"
          font-weight="700"
          font-family="Arial, sans-serif"
        >
          ${safeLocation}
        </text>

        <!-- FOOTER -->

        <text
          x="80"
          y="1210"
          fill="#cbd5e1"
          font-size="25"
          font-family="Arial, sans-serif"
        >
          Register now • Eventify
        </text>

      </svg>
      `;

      // =========================
      // FILE NAME
      // =========================

      const fileName =
        `poster-${Date.now()}.png`;

      const filePath =
        path.join(
          posterDirectory,
          fileName
        );

      // =========================
      // CREATE PNG
      // =========================

      await sharp(
        Buffer.from(svg)
      )
        .png()
        .toFile(filePath);

      const imageUrl =
        `/uploads/posters/${fileName}`;

      console.log(
        "✅ Free poster generated:",
        imageUrl
      );

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Poster generated successfully",
          imageUrl,
        });
    } catch (error) {
      console.error(
        "❌ Poster generation error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Failed to generate poster",
          error:
            error.message,
        });
    }
  }
);

export default router;