import { spawnSync } from "node:child_process";

const acceptedAdvisories = new Map([
  [
    1124282,
    {
      module: "react-router",
      expires: "2027-01-31",
      reason:
        "GHSA-qwww-vcr4-c8h2 affects only React Router's unstable RSC APIs; Suff Royale is a client-only createBrowserRouter SPA and does not enable RSC.",
    },
  ],
]);

const result = spawnSync("yarn", ["audit", "--json", "--groups", "dependencies"], {
  encoding: "utf8",
});
if (result.error) throw result.error;

const auditEvents = result.stdout
  .split("\n")
  .filter(Boolean)
  .map((line) => JSON.parse(line));
const advisories = auditEvents
  .filter((entry) => entry.type === "auditAdvisory")
  .map((entry) => entry.data.advisory);

if (result.status !== 0 && advisories.length === 0) {
  console.error(result.stderr || result.stdout || `yarn audit failed with status ${result.status}`);
  process.exit(result.status ?? 1);
}

const today = new Date().toISOString().slice(0, 10);
const failures = advisories.filter((advisory) => {
  const accepted = acceptedAdvisories.get(advisory.id);
  return !accepted || accepted.module !== advisory.module_name || accepted.expires < today;
});

for (const advisory of advisories) {
  const accepted = acceptedAdvisories.get(advisory.id);
  if (accepted && !failures.includes(advisory)) {
    console.warn(`Accepted until ${accepted.expires}: ${advisory.github_advisory_id} - ${accepted.reason}`);
  }
}

if (failures.length > 0) {
  for (const advisory of failures) {
    console.error(`${advisory.severity}: ${advisory.module_name} ${advisory.github_advisory_id} ${advisory.title}`);
  }
  process.exit(1);
}

console.log(`Dependency audit passed (${advisories.length} reviewed advisory exception(s)).`);
