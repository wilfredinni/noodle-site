// Run from the site root: bun scripts/check-cookbooks.ts ../noodle
// Execute the published examples in Noodle's real sandbox with stubbed HTTP results.
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
const sections = new Map<string, string>();
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
    sections.set(heading, section);
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
async function run(
  phase: string, source: string, body: unknown, scope = new RunScope(), status = 200,
  prepared = request, environment?: { name: string; vars: Record<string, string> },
  options = {},
) {
  assert.equal(typeof source, "string", "Published example has script source");
  executions++;
  return runRequestScript(phase, source, prepared, environment, scope, { response: response(body, status) }, options);
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
  ["Detect duplicate IDs", [{ id: 7 }, { id: 8 }], [
    [{ id: 7 }, { id: 7 }], [{ id: "7" }], [{}], [{ id: 0 }],
  ]],
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

const consistency = block("Check that the response reflects the request");
const sent = { ...JSON.parse(consistency.body), name: "Changed by a pre script" };
const prepared = { ...request, method: consistency.method, bodyType: consistency.body_type, body: JSON.stringify(sent) };
for (const [body, expected] of [[{ ...sent, id: 7 }, true], [{ ...sent, active: true }, false], [{ name: sent.name }, false]] as const) {
  const result = await run("tests", consistency.tests, body, new RunScope(), 200, prepared);
  assert.equal(result.tests[0].passed, expected, "Response must match the prepared request");
}

const datasetHeading = "Use expected values from a dataset";
const rows = JSON.parse(sections.get(datasetHeading)!.match(/```json\n([\s\S]*?)```/)![1]!);
for (const [index, row] of rows.entries()) {
  const rowScope = new RunScope({ index, count: rows.length, data: row });
  rowScope.set("expected_active", !row.expected_active);
  for (const matches of [true, false]) {
    const result = await run("tests", block(datasetHeading).tests, {
      id: row.user_id, active: matches ? row.expected_active : !row.expected_active, role: row.expected_role,
    }, rowScope);
    assert.equal(result.tests[0].passed, matches, "Dataset checks use the original typed row");
  }
}
assert.equal((await run("tests", block(datasetHeading).tests, {})).tests[0].passed, false, "Missing dataset fails");

const productScope = new RunScope();
const productEnvironment = { name: "development", vars: { TARGET_SKU: "NOODLE-MUG" } };
for (const [body, expected] of [
  [[{ id: 8, sku: "NOODLE-SHIRT" }, { id: 7, sku: "NOODLE-MUG" }], true],
  [[{ id: 8, sku: "NOODLE-SHIRT" }], false],
  [[{ id: 7, sku: "NOODLE-MUG" }, { id: 8, sku: "NOODLE-MUG" }], false],
  [[{ id: "7", sku: "NOODLE-MUG" }], false],
] as const) {
  const result = await run("post", block("Find a record by a field").scripts.post, body, productScope, 200, request, productEnvironment);
  assert.equal(result.result.success, expected, "Product lookup requires exactly one valid match");
  assert.equal(productScope.get("product_id"), 7, "A failed lookup preserves the previous value");
}

const loginHeading = "Log in once and reuse the token";
const loginSource = block(loginHeading, 1).scripts.pre;
const loginScope = new RunScope();
let logins = 0;
let session: Record<string, unknown> = { token: "cookbook-token", expires_in: 3600 };
const loginOptions = {
  execute: async (kind: string, input: unknown) => {
    assert.equal(kind, "saved");
    assert.equal(input, "auth/login");
    logins++;
    return { response: response(session), failureCategories: [] };
  },
};
for (const expectedLogins of [1, 1]) {
  const result = await run("pre", loginSource, {}, loginScope, 200, request, undefined, loginOptions);
  assert(result.result.success, JSON.stringify(result.result.error));
  assert.equal(result.request.auth.token, "cookbook-token");
  assert.equal(logins, expectedLogins, "Valid cached tokens avoid another login");
}
loginScope.set("SESSION_EXPIRES_AT", Date.now() + 10000);
assert((await run("pre", loginSource, {}, loginScope, 200, request, undefined, loginOptions)).result.success);
assert.equal(logins, 2, "Tokens within the expiry margin refresh");
loginScope.set("SESSION_EXPIRES_AT", 0);
for (const invalid of [{ token: "", expires_in: 3600 }, { token: "new-token", expires_in: "3600" }, { token: "new-token", expires_in: 1 }]) {
  session = invalid;
  assert(!(await run("pre", loginSource, {}, loginScope, 200, request, undefined, loginOptions)).result.success);
  assert.equal(loginScope.get("SESSION_TOKEN"), "cookbook-token", "Invalid refresh cannot replace the cached token");
}

const lifecycleSource = block("Create and clean up a test resource").scripts.post;
const lifecycleEnvironment = { name: "development", vars: { API_TOKEN: "cookbook-secret" } };
for (const scenario of ["success", "update fails", "verification fails", "cleanup fails", "both fail", "invalid ID"]) {
  const methods: string[] = [];
  const result = await run("post", lifecycleSource, { id: scenario === "invalid ID" ? "../other" : 7 }, new RunScope(), 201, request, lifecycleEnvironment, {
    execute: async (kind: string, input: any) => {
      assert.equal(kind, "http");
      assert.equal(input.url, "https://api.example.com/users/7");
      assert.equal(input.headers.Authorization, "Bearer cookbook-secret");
      const method = input.method ?? "GET";
      methods.push(method);
      if (method === "PATCH") assert.deepEqual(JSON.parse(input.body), { name: "Updated Cookbook User" });
      const fails = (method === "PATCH" && ["update fails", "both fail"].includes(scenario)) ||
        (method === "DELETE" && ["cleanup fails", "both fail"].includes(scenario));
      return {
        response: response({ id: 7, name: scenario === "verification fails" ? "Cookbook User" : "Updated Cookbook User" }, fails ? 500 : method === "DELETE" ? 204 : 200),
        failureCategories: fails ? ["http"] : [],
        ...(fails ? { error: { name: "Error", message: `${method} failed` } } : {}),
      };
    },
  });
  assert.equal(result.result.success, scenario === "success", scenario);
  assert.deepEqual(methods, scenario === "invalid ID" ? [] : ["update fails", "both fail"].includes(scenario) ? ["PATCH", "DELETE"] : ["PATCH", "GET", "DELETE"], scenario);
  if (scenario === "both fail") assert.match(result.result.error.message, /PATCH failed/, "Preserve the original failure");
  if (["cleanup fails", "both fail"].includes(scenario)) {
    assert.match(JSON.stringify(result.result.logs), /Cleanup failed for user.*7/, "Log the ID for manual cleanup");
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
