require("dotenv").config();

const jsonfile = require("jsonfile");
const moment = require("moment");
const simpleGit = require("simple-git");

const FILE_PATH = "./data.json";

const CONFIG = {
  repositoryUrl: `https://${process.env.GITHUB_USERNAME}:${process.env.GITHUB_TOKEN}@github.com/shub-script/Test.git`,
  branch: "main",
  entryCount: 200,
};

const git = simpleGit();

function getRandomPastDate() {
  const weeks = Math.floor(Math.random() * 53);
  const days = Math.floor(Math.random() * 7);

  return moment()
    .subtract(weeks, "weeks")
    .subtract(days, "days")
    .format();
}

function buildActivityEntries(count) {
  const generatedAt = moment().format();
  const entries = [];

  for (let index = 1; index <= count; index += 1) {
    entries.push({
      id: index,
      generatedAt,
      activityDate: getRandomPastDate(),
      note: "Generated activity log entry",
    });
  }

  return entries;
}

async function ensureRemote() {
  const remotes = await git.getRemotes(true);
  const origin = remotes.find((remote) => remote.name === "origin");

  if (!origin) {
    await git.addRemote("origin", CONFIG.repositoryUrl);
    return;
  }

  if (origin.refs.fetch !== CONFIG.repositoryUrl) {
    await git.remote(["set-url", "origin", CONFIG.repositoryUrl]);
  }
}

async function run() {
  try {
    await ensureRemote();

    const data = {
      updatedAt: moment().format(),
      entryCount: CONFIG.entryCount,
      entries: buildActivityEntries(CONFIG.entryCount),
    };

    // Write JSON data
    await jsonfile.writeFile(FILE_PATH, data, { spaces: 2 });

    // Git operations
    await git.add([FILE_PATH, "index.js", "package.json"]);
    await git.commit(
      `Update activity log with ${CONFIG.entryCount} entries`
    );

    await git.push("origin", CONFIG.branch);

    console.log(
      "Done. Activity log committed and pushed to GitHub."
    );
  } catch (error) {
    console.error("Script failed:", error.message);
    process.exit(1);
  }
}

run();