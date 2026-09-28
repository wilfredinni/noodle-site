// Run from the site root: bun scripts/check-cookbooks.ts ../noodle
// Execute the published examples in Noodle's real sandbox without network calls.
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { load } from "js-yaml";

const noodle = resolve(process.argv[2] ?? "../noodle");
const { runRequestScript } = await import(pathToFileURL(`${noodle}/src/preRequestScript.ts`).href);
const { RunScope } = await import(pathToFileURL(`${noodle}/src/runScope.ts`).href);
const { lang } = await import(pathToFileURL(`${noodle}/src/lang/index.ts`).href);
const directory = "src/content/docs/docs/cookbooks";
const recipes = new Map<string, Record<string, any>[]>();
let yamlBlocks = 0;
let executions = 0;

for (const file of await readdir(directory)) {
  const source = await readFile(`${directory}/${file}`, "utf8");
  for (const section of source.split(/^## /m).slice(1)) {
    const heading = section.split("\n")[0]!;
    const blocks = [...section.matchAll(/```yaml\n([\s\S]*?)```/g)].map((match) => {
      const parsed = load(match[1]!) as Record<string, any>;
      assert(parsed && typeof parsed === "object", `${heading}: YAML object`);
      if (parsed.url) lang.parseRequest("cookbook-check", match[1]!);
      yamlBlocks++;
      return parsed;
    });
    assert(!recipes.has(heading), `Duplicate recipe: ${heading}`);
    recipes.set(heading, blocks);
  }
}

const request = {
  id: "cookbook-check", name: "Cookbook check", method: "GET",
  url: "https://api.example.com/check", headers: {}, params: [], timeout: 0,
};
const response = (body: unknown, status = 200, headers = { "Content-Type": "application/json" }) => ({
  status, statusText: status === 201 ? "Created" : "OK", timeMs: 12,
  headers, body: JSON.stringify(body),
});
async function run(phase: string, source: string, body: unknown, scope = new RunScope(), status = 200) {
  assert.equal(typeof source, "string", "Published example has script source");
  executions++;
  return runRequestScript(phase, source, request, undefined, scope, { response: response(body, status) });
}
function block(heading: string, index = 0) {
  const value = recipes.get(heading)?.[index];
  assert(value, `Missing recipe: ${heading}, block ${index}`);
  return value;
}

const cases: [string, unknown, unknown[]][] = [
  ["Validate a JSON schema", { id: 7, email: "reader@example.com", active: true }, [
    { id: "7", email: "reader@example.com", active: true },
    { id: 7, email: "invalid", active: true },
  ]],
  ["Check every item in an array", [{ id: 1, active: true }], [[], [{ id: 1, active: false }]]],
  ["Compare related fields", { subtotal: 1000, tax: 200, total: 1200 }, [
    { subtotal: 1000, tax: 200, total: 1199 },
    { subtotal: "1000", tax: 200, total: 1200 },
  ]],
  ["Verify sorting and pagination", { page: 2, items: [{ price: 10 }, { price: 20 }] }, [
    { page: 1, items: [] },
    { page: 2, items: [{ price: 20 }, { price: 10 }] },
    { page: 2, items: [{ price: 1 }, { price: 2 }, { price: 3 }] },
  ]],
];
for (const [heading, valid, invalid] of cases) {
  for (const [body, expected] of [[valid, true], ...invalid.map((body) => [body, false])] as [unknown, boolean][]) {
    const result = await run("tests", block(heading).tests, body);
    assert(result.tests?.length, `${heading}: declares tests`);
    const passed = result.result.success && result.tests.every((test: { passed: boolean }) => test.passed);
    assert.equal(passed, expected, `${heading}: ${JSON.stringify(body)}`);
  }
}

const folderTests = block("Share checks across a folder").tests;
const shared = await run("tests", folderTests, { id: 7 });
assert(shared.result.success && shared.tests.every((test: { passed: boolean }) => test.passed));
executions++;
const missingHeader = await runRequestScript("tests", folderTests, request, undefined, new RunScope(), {
  response: response({ id: 7 }, 200, {} as { "Content-Type": string }),
});
assert(missingHeader.tests.some((test: { passed: boolean }) => !test.passed));

const normalized = new RunScope();
normalized.set("raw_region", "  EU-WEST  ");
assert((await run("post", block("Transform a captured value").scripts.post, {}, normalized)).result.success);
assert.equal(normalized.get("region"), "eu-west");
normalized.set("raw_region", 7);
assert(!(await run("post", block("Transform a captured value").scripts.post, {}, normalized)).result.success);
assert.equal(normalized.get("region"), "eu-west", "Failed post preserves earlier writes");

const scope = new RunScope();
const inherited = recipes.get("Apply a shared default before request processing")!;
for (const entry of inherited) {
  assert((await run("post", entry.scripts.post, { id: 7 }, scope, 201)).result.success);
}
assert.equal(scope.get("created_resource_id"), 7);
const inheritedTest = await run("tests", inherited[1]!.tests, { id: 7 }, scope, 201);
assert(inheritedTest.result.success && inheritedTest.tests.every((test: { passed: boolean }) => test.passed));

const captured = new RunScope();
captured.set("created_user_id", 7);
for (const id of [7, 8]) {
  const result = await run("tests", block("Create a resource and fetch it", 1).tests, { id }, captured);
  assert.equal(result.tests[0].passed, id === 7);
}
console.log(`Cookbooks: ${yamlBlocks} YAML blocks parsed; ${executions} sandbox executions passed.`);
