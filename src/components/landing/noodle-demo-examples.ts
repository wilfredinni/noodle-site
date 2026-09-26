// Adapted from noodle/collections and noodle-use. Responses are fixed, local samples.
export type Example = {
  id: string; folder: string; name: string; method: string; path: string; tab: string;
  body: string; response: unknown; status: string; duration: number;
  baseUrl?: string;
  bodyFormat?: string;
  formData?: { name: string; value: string; type?: string }[];
  pathParams?: Record<string, string>;
  headers?: Record<string, string>;
  params?: { name: string; value: string; enabled?: boolean }[];
  auth?: { type: string; fields: Record<string, string> };
  tags?: string[];
  assertions?: { expression: string; operator: string; value?: string | number; actual: string | number }[];
  captures?: { variable: string; expression: string; value: string | number }[];
  scripts?: { pre?: string; post?: string };
  scriptFiles?: { pre?: string; post?: string };
  tests?: string;
  testNames?: string[];
  cookies?: { name: string; value: string; domain: string; path: string }[];
}

const user = { id: 1, name: "Ada Lovelace", username: "ada", email: "ada@example.com" }
const post = { userId: 1, id: 1, title: "A post from Noodle", body: "Requests live in readable YAML files." }
const comment = { postId: 1, id: 1, name: "A useful example", email: "ada@example.com", body: "Sent from Noodle." }
const json = (value: unknown) => JSON.stringify(value, null, 2)
export const folders = ["body templates", "assertions & captures", "authentication", "scripts", "tests", "requests"]
const authExamples: (Pick<Example, "id" | "name" | "path" | "baseUrl" | "response"> & NonNullable<Example["auth"]>)[] = [
  { id: "bearer-auth", name: "Bearer token", path: "/bearer", type: "Bearer Token", fields: { Token: "$api_token" }, response: { authenticated: true, token: "[REDACTED]" } },
  { id: "basic-auth", name: "Basic auth", path: "/basic-auth/$username/$password", type: "Basic Auth", fields: { Username: "$username", Password: "$password" }, response: { authenticated: true, user: "demo" } },
  { id: "api-key-auth", name: "API key", path: "/headers", type: "API Key", fields: { Key: "X-API-Key", Value: "$api_key", "Add To": "Header" }, response: { headers: { "X-Api-Key": "[REDACTED]" } } },
  { id: "oauth2-auth", name: "OAuth 2.0 + PKCE", baseUrl: "https://api.example.com", path: "/v1/profile", type: "OAuth 2.0", fields: { "Grant Type": "Authorization Code", "Discovery URL": "https://identity.example.com", "Client ID": "$oauth2_client_id", "Client Secret": "$oauth2_client_secret", Scope: "openid profile", "Redirect URI": "http://127.0.0.1:8765/oauth/callback", PKCE: "S256" }, response: user },
  { id: "oauth1-auth", name: "OAuth 1.0a", baseUrl: "https://api.example.com", path: "/v1/profile", type: "OAuth 1.0a", fields: { "Consumer Key": "$consumer_key", "Consumer Secret": "$consumer_secret", "Access Token": "$access_token", "Access Token Secret": "$token_secret", "Signature Method": "HMAC-SHA256", "Add To": "Header" }, response: user },
  { id: "aws-auth", name: "AWS SigV4", baseUrl: "https://api.example.com", path: "/items", type: "AWS Signature v4", fields: { "Access Key": "$aws_access_key", "Secret Key": "$aws_secret_key", Region: "us-east-1", Service: "execute-api", "Session Token": "$aws_session_token" }, response: { items: [{ id: 1, name: "Sample item" }] } },
  { id: "ntlm-auth", name: "NTLM", baseUrl: "https://intranet.example.com", path: "/api/profile", type: "NTLM", fields: { Username: "$ntlm_username", Password: "$ntlm_password", Domain: "$ntlm_domain", Workstation: "$ntlm_workstation" }, response: user },
]
export const examples: Example[] = [
  {
    id: "create", folder: "body templates", name: "Random comment", method: "POST", path: "/comments", tab: "Body",
    body: '{\n  "postId": 1,\n  "name": $random.name,\n  "email": $random.email,\n  "body": $random.loremSentence\n}',
    response: { ...comment, id: 501, name: user.name }, status: "201 Created", duration: 124,
  },
  {
    id: "random-post", folder: "body templates", name: "Typed random", method: "POST", path: "/posts", tab: "Body",
    body: '{\n  "title": "$random.words({\\"count\\":3})",\n  "userId": $random.number({"min":1,"max":10}),\n  "requestId": $random.uuid,\n  "role": $random.pick(["admin","user"]),\n  "active": $random.boolean\n}',
    response: { id: 101, title: "Ship useful things", userId: 3, requestId: "a6f48b17-2d04-4c25-a853-e382e2d4af19", role: "user", active: true }, status: "201 Created", duration: 116,
  },
  {
    id: "time-post", folder: "body templates", name: "Time placeholders", method: "POST", path: "/posts", tab: "Body",
    body: '{\n  "title": "Timestamped post",\n  "body": "Created at $time.iso",\n  "createdAt": $time.iso,\n  "timestampMs": $time.now,\n  "timestampSeconds": $time.unix\n}',
    response: { id: 101, title: "Timestamped post", body: "Created at 2026-09-26T12:00:00.000Z", createdAt: "2026-09-26T12:00:00.000Z", timestampMs: 1790424000000, timestampSeconds: 1790424000 }, status: "201 Created", duration: 102,
  },
  {
    id: "assert-post", folder: "assertions & captures", name: "Check a response", method: "GET", path: "/posts/:postId", pathParams: { postId: "1" }, tab: "Assert",
    body: "", response: post, status: "200 OK", duration: 86, tags: ["smoke", "posts"],
    assertions: [
      { expression: "status", operator: "equals", value: 200, actual: 200 },
      { expression: "headers.content-type", operator: "contains", value: "application/json", actual: "application/json; charset=utf-8" },
      { expression: "body.id", operator: "isNumber", actual: 1 },
      { expression: "response.time", operator: "lt", value: 3000, actual: 86 },
    ],
  },
  {
    id: "capture-post", folder: "assertions & captures", name: "Capture values", method: "POST", path: "/posts", tab: "Capture",
    body: json({ title: "Capture example", userId: 1 }), response: { id: 101, title: "Capture example", userId: 1 }, status: "201 Created", duration: 112,
    tags: ["capture-chain"],
    captures: [
      { variable: "created_post_id", expression: "body.id", value: 101 },
      { variable: "created_user_id", expression: "body.userId", value: 1 },
      { variable: "response_content_type", expression: "headers.content-type", value: "application/json; charset=utf-8" },
    ],
  },
  {
    id: "use-captures", folder: "assertions & captures", name: "Reuse captures", method: "GET", path: "/users/$created_user_id", tab: "Params",
    headers: { Accept: "$response_content_type" }, params: [{ name: "created_post_id", value: "$created_post_id" }], tags: ["capture-chain"],
    body: "", response: user, status: "200 OK", duration: 93,
  },
  ...authExamples.map((auth): Example => ({
    id: auth.id, folder: "authentication", name: auth.name, method: "GET", baseUrl: auth.baseUrl ?? "https://httpbin.org", path: auth.path, tab: "Auth", body: "",
    auth: { type: auth.type, fields: auth.fields }, response: auth.response, status: "200 OK", duration: 98,
  })),
  {
    id: "create-post", folder: "scripts", name: "Prepare a request", method: "POST", path: "/posts", tab: "Pre Script",
    body: json({ title: "Prepared with a script", userId: 1 }), response: { id: 101, title: "Prepared with a script", userId: 1 }, status: "201 Created", duration: 108,
    scripts: { pre: 'const requestId = noodle.random.uuid();\nconst now = noodle.time.now();\nnoodle.request.headers.set("X-Request-ID", requestId);\nnoodle.request.headers.set("X-Sent-At", noodle.time.iso(now));' },
  },
  {
    id: "get-user", folder: "scripts", name: "Save values", method: "GET", path: "/users/:userId", pathParams: { userId: "1" }, tab: "Post Script",
    body: "", response: user, status: "200 OK", duration: 108,
    scripts: { post: 'const user = noodle.response.json();\nif (noodle.response.status === 200) {\n  noodle.run.set("USER_EMAIL", user.email);\n  noodle.run.set("USER_NAME", user.name);\n}' },
  },
  {
    id: "signed-request", folder: "scripts", name: "Sign with crypto", method: "POST", baseUrl: "https://httpbin.org", path: "/post", tab: "Pre Script",
    body: json({ event: "order.created", orderId: 42 }), response: { json: { event: "order.created", orderId: 42 }, headers: { "X-Signature": "[REDACTED]" } }, status: "200 OK", duration: 137,
    scripts: { pre: 'const secret = noodle.env.get("signing_secret");\nconst payload = noodle.request.body.text();\nconst signature = noodle.crypto.hmacSha256(secret, payload, "hex");\nnoodle.request.headers.set("X-Signature", signature);' },
  },
  {
    id: "chain-request", folder: "scripts", name: "Chain requests", method: "GET", path: "/posts/1", tab: "Pre Script",
    body: "", response: post, status: "200 OK", duration: 186,
    scripts: { pre: 'const post = await noodle.runRequest("assertions/get-post");\nconst user = await noodle.sendRequest({\n  url: "https://jsonplaceholder.typicode.com/users/" + post.json().userId,\n});\nnoodle.request.headers.set("X-User-Name", user.json().username);' },
  },
  {
    id: "external-script", folder: "scripts", name: "External JS file", method: "GET", path: "/posts/1", tab: "Pre Script",
    body: "", response: post, status: "200 OK", duration: 105,
    scriptFiles: { pre: "./scripts/prepare-request.js" },
    scripts: { pre: 'noodle.request.headers.set("X-Request-ID", noodle.random.uuid());\nnoodle.request.headers.set("Accept", "application/json");' },
  },
  {
    id: "update-todo", folder: "tests", name: "Named tests", method: "PATCH", path: "/todos/:todoId", pathParams: { todoId: "1" }, tab: "Tests",
    body: json({ completed: true }), response: { userId: 1, id: 1, title: "Try Noodle", completed: true }, status: "200 OK", duration: 109,
    tests: 'test("todo is complete", () => {\n  expect(noodle.response.json().completed).toBe(true);\n});\ntest("todo belongs to user 1", () => {\n  expect(noodle.response.json().userId).toBe(1);\n});',
    testNames: ["todo is complete", "todo belongs to user 1"],
  },
  {
    id: "schema-test", folder: "tests", name: "JSON Schema", method: "GET", path: "/users/1", tab: "Tests",
    body: "", response: user, status: "200 OK", duration: 94,
    tests: 'test("user matches the schema", () => {\n  expect(noodle.response.json()).toMatchSchema({\n    type: "object",\n    required: ["id", "name", "email"],\n    properties: {\n      id: { type: "integer", minimum: 1 },\n      name: { type: "string", minLength: 1 },\n      email: { type: "string", format: "email" },\n    },\n  });\n});',
    testNames: ["user matches the schema"],
  },
  {
    id: "list-test", folder: "tests", name: "Test every user", method: "GET", path: "/users", tab: "Tests",
    body: "", response: [user, { id: 2, name: "Grace Hopper", username: "grace", email: "grace@example.com" }], status: "200 OK", duration: 117,
    tests: 'for (const user of noodle.response.json()) {\n  test("user " + user.id + " has contact details", () => {\n    expect(user.id).toBeGreaterThan(0);\n    expect(user.name).not.toBe("");\n    expect(user.email).toContain("@");\n  });\n}',
    testNames: ["user 1 has contact details", "user 2 has contact details"],
  },
  {
    id: "data-test", folder: "tests", name: "CSV / JSON data", method: "GET", path: "/users/$user_id", tab: "Tests",
    body: "", response: user, status: "200 OK", duration: 97, tags: ["data-driven"],
    tests: '// In F5, select a CSV or JSON data file.\n// Example JSON row: { "user_id": 1 }\ntest("user matches the current data row", () => {\n  const row = noodle.iteration?.data;\n  expect(row).toBeDefined();\n  expect(noodle.response.json().id).toBe(Number(row.user_id));\n});',
    testNames: ["user matches the current data row"],
  },
  {
    id: "get", folder: "requests", name: "Path parameters", method: "GET", path: "/comments/:commentId", pathParams: { commentId: "1" }, tab: "Path",
    body: "", response: comment, status: "200 OK", duration: 86,
  },
  {
    id: "get-posts", folder: "requests", name: "Query parameters", method: "GET", path: "/posts", tab: "Params",
    params: [{ name: "userId", value: "1" }, { name: "_limit", value: "2" }, { name: "_sort", value: "title", enabled: false }],
    body: "", response: [post, { ...post, id: 2, title: "Another post" }], status: "200 OK", duration: 91,
  },
  {
    id: "update", folder: "requests", name: "Update a comment", method: "PATCH", path: "/comments/:commentId", pathParams: { commentId: "1" }, tab: "Body",
    body: json({ body: "Updated with Noodle." }), response: { ...comment, body: "Updated with Noodle." }, status: "200 OK", duration: 112,
  },
  {
    id: "put-post", folder: "requests", name: "Replace a post", method: "PUT", path: "/posts/:postId", pathParams: { postId: "1" }, tab: "Body",
    body: json({ title: "Replaced title", body: "Replaced body", userId: 1 }), response: { id: 1, title: "Replaced title", body: "Replaced body", userId: 1 }, status: "200 OK", duration: 103,
  },
  {
    id: "delete-post", folder: "requests", name: "Delete a post", method: "DELETE", path: "/posts/:postId", pathParams: { postId: "1" }, tab: "Path",
    body: "", response: {}, status: "200 OK", duration: 78,
  },
  {
    id: "form-post", folder: "requests", name: "URL-encoded form", method: "POST", baseUrl: "https://httpbin.org", path: "/post", tab: "Body", bodyFormat: "Form URL Encoded",
    formData: [{ name: "name", value: "Ada Lovelace" }, { name: "email", value: "ada@example.com" }],
    headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "name=Ada+Lovelace&email=ada%40example.com", response: { form: { name: "Ada Lovelace", email: "ada@example.com" } }, status: "200 OK", duration: 121,
  },
  {
    id: "multipart-post", folder: "requests", name: "Multipart upload", method: "POST", baseUrl: "https://httpbin.org", path: "/post", tab: "Body", bodyFormat: "Multipart Form",
    headers: {}, formData: [{ name: "username", value: "ada", type: "text" }, { name: "readme", value: "./README.md", type: "file" }],
    body: "", response: { form: { username: "ada" }, files: { readme: "# Example collection" } }, status: "200 OK", duration: 149,
  },
  {
    id: "binary-post", folder: "requests", name: "Binary upload", method: "POST", baseUrl: "https://httpbin.org", path: "/post", tab: "Body", bodyFormat: "Binary",
    headers: { "Content-Type": "application/octet-stream" }, body: "./README.md", response: { data: "# Example collection" }, status: "200 OK", duration: 131,
  },
  {
    id: "xml-post", folder: "requests", name: "XML body", method: "POST", baseUrl: "https://httpbin.org", path: "/post", tab: "Body", bodyFormat: "XML",
    headers: { "Content-Type": "application/xml" }, body: '<message>\n  <to>Ada</to>\n  <text>Hello from Noodle</text>\n</message>', response: { data: '<message>\n  <to>Ada</to>\n  <text>Hello from Noodle</text>\n</message>' }, status: "200 OK", duration: 114,
  },
  {
    id: "cookie-request", folder: "requests", name: "Capture a cookie", method: "GET", baseUrl: "https://httpbin.org", path: "/cookies/set", tab: "Params",
    params: [{ name: "theme", value: "noodle" }], body: "", response: { cookies: { theme: "noodle" } }, status: "200 OK", duration: 143,
    cookies: [{ name: "theme", value: "noodle", domain: "httpbin.org", path: "/" }],
  },
]

export const tourChapters: { request: string; title: string; description: string; responseTab?: string }[] = [
  { request: "create", title: "Random request data", description: "Put names, email addresses, and text directly into a JSON body with $random placeholders. Compare the template with its sample response." },
  { request: "random-post", title: "Keep generated values typed", description: "Generate numbers, booleans, UUIDs, and choices in your request body. Whole-value placeholders keep their JSON types." },
  { request: "time-post", title: "Timestamps without a script", description: "Use $time placeholders for ISO dates, milliseconds, and Unix seconds. One request uses a shared timestamp across its body." },
  { request: "bearer-auth", title: "Authenticate with variables", description: "Reference an environment variable in the Auth tab to send a bearer token. The sample response keeps the token redacted." },
  { request: "oauth2-auth", title: "OAuth 2.0 with PKCE", description: "Configure discovery, scopes, and PKCE in the Auth tab. This read-only example shows the setup and a sample profile response." },
  { request: "create-post", title: "Pre-request scripts", description: "Prepare a request before it is sent. This script adds a unique request ID and timestamp to the headers; Results shows a sample successful execution.", responseTab: "Results" },
  { request: "get-user", title: "Post-request scripts", description: "Read the response and save values for later requests in the same run. This script saves the user's email and name after a successful response.", responseTab: "Results" },
  { request: "external-script", title: "Scripts in their own files", description: "Keep reusable JavaScript in a .js file beside your collection. The source selector shows the file path and a preview of its contents.", responseTab: "Results" },
  { request: "signed-request", title: "Sign a request", description: "Read a secret from the environment, sign the body with HMAC-SHA256, and attach the signature as a header before sending." },
  { request: "chain-request", title: "Chain requests in a script", description: "Await a saved request, use its response in another call, then prepare the current request. Results shows a sample script execution.", responseTab: "Results" },
  { request: "capture-post", title: "Capture response values", description: "Save response fields and headers as variables for the current run. Open a captured result to inspect its sample value.", responseTab: "Results" },
  { request: "use-captures", title: "Reuse captured values", description: "Use the previous request's captures in a URL, query parameter, or header. Here, the captured user ID identifies the next request's user." },
  { request: "assert-post", title: "Check a response", description: "Check status, headers, body values, and response time without writing a script. Results pairs each assertion with its sample outcome.", responseTab: "Results" },
  { request: "update-todo", title: "Write named tests", description: "Describe expected behavior with test() and expect(). Each test appears by name in Results, with details you can expand.", responseTab: "Results" },
  { request: "schema-test", title: "Validate a JSON Schema", description: "Check required fields, value types, and formats together. This test validates a user's ID, name, and email against a schema.", responseTab: "Results" },
  { request: "data-test", title: "Test with CSV or JSON data", description: "In Noodle's runner, choose a data file to repeat requests with different inputs. This sample test compares the response with the current row.", responseTab: "Results" },
  { request: "get", title: "Readable path parameters", description: "Keep a named parameter in the URL and set its value in the Path tab. This example requests the comment with ID 1." },
  { request: "get-posts", title: "Control query parameters", description: "Set query values and keep optional parameters disabled until you need them. This request filters posts by user and limits the results." },
  { request: "form-post", title: "Send form fields", description: "Send URL-encoded fields from a name-and-value table. The sample response shows the form data received by the server." },
  { request: "multipart-post", title: "Upload files with fields", description: "Combine text fields and file paths in a multipart request. This example pairs a username with a README upload." },
  { request: "xml-post", title: "Send an XML body", description: "Choose the body format your API expects. This request sends an XML message with the matching Content-Type header." },
  { request: "cookie-request", title: "Inspect response cookies", description: "See captured cookies alongside their values, domains, and paths. This sample response sets a theme cookie for httpbin.org.", responseTab: "Cookies" },
]
