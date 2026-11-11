function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

const projectImages = {
  fast: "images/fast.png",
  gameoflife: "images/gameOfLife.png",
  godotchess: "images/godotChess.png",
  keydown: "images/keyDown.png",
  shooterchaos: "images/shooterChaos.png",
  spacerush: "images/space.png",
  tictactui: "images/TicTacTui.png",
  wordlesolver: "images/wordleSolver.png",
  memoryguessr: "images/memoryGuessr.png",
  brainfuck: "images/brainfuck.png",
  flashcard: "images/flashCard.png"
};

function parseProjects(rawText) {
  const lines = rawText.split(/\r?\n/).map((line) => line.trim());
  const todoIndex = lines.findIndex((line) => line.toLowerCase() === "todo:");
  const projectLines = lines
    .slice(0, todoIndex === -1 ? lines.length : todoIndex)
    .filter(Boolean)
    .filter((line) => !/^https?:\/\//i.test(line));
  const slugCounts = {};

  return projectLines
    .map((line) => {
      const flags = Array.from(line.matchAll(/\(([^)]+)\)/g)).map((match) => match[1].trim());
      const shortDescriptionMatch = line.match(/\{([^}]*)\}/);
      const longDescriptionMatch = line.match(/\[([^\]]*)\]/);
      const githubMatch = line.match(/[ \t]+@[ \t]*(https?:\/\/\S+)?/i);
      const shortDescription = shortDescriptionMatch ? shortDescriptionMatch[1].trim() : "";
      const longDescription = longDescriptionMatch ? longDescriptionMatch[1].trim() : "";
      const openSource = Boolean(githubMatch);
      const workInProgress = /\bwip\b/i.test(shortDescription);
      const name = line
        .replace(/\s*\([^)]*\)/g, "")
        .replace(/\s*\{[^}]*\}/g, "")
        .replace(/\s*\[[^\]]*\]/g, "")
        .replace(/[ \t]+@[ \t]*(?:https?:\/\/\S+)?/gi, "")
        .trim();
      const baseSlug = slugify(name);
      slugCounts[baseSlug] = (slugCounts[baseSlug] || 0) + 1;
      const slug = slugCounts[baseSlug] === 1
        ? baseSlug
        : `${baseSlug}-${slugCounts[baseSlug]}`;

      return {
        name,
        flags,
        shortDescription,
        longDescription,
        openSource,
        workInProgress,
        slug,
        image: projectImages[baseSlug] || "",
        githubUrl: githubMatch && githubMatch[1]
          ? githubMatch[1]
          : `https://github.com/${name.trim().replace(/\s+/g, "-")}`
      };
    })
    .filter((project) => project.name);
}

async function loadProjects() {
  const response = await fetch("projects.txt", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Unable to load projects.txt (${response.status})`);
  }
  return parseProjects(await response.text());
}
