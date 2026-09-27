// At a viewport of at least 680px, paste this file into the landing page's browser console, then run:
// await checkNoodleDemo()
// Guided tour checks: await checkNoodleTour()
async function checkNoodleDemo(doc = document) {
  const demo = doc.querySelector("[data-noodle-demo]")
  const checks = []
  const assert = (condition, message) => {
    if (!condition) throw new Error(message)
    checks.push(message)
  }
  assert(demo, "Demo exists")
  const view = doc.defaultView
  const wait = () => new Promise((resolve) => view.setTimeout(resolve, 550))
  const waitForStyle = async (condition) => {
    const deadline = view.performance.now() + 2000
    while (!condition()) {
      if (view.performance.now() > deadline) throw new Error("Timed out waiting for browser styles")
      await new Promise((resolve) => view.requestAnimationFrame(resolve))
    }
  }
  const choice = (id) => demo.querySelector(`[data-request="${id}"]`)
  const active = () => demo.querySelector("[data-example]:not([hidden])")
  const live = demo.querySelector("[data-demo-status]")
  const footer = () => demo.querySelector("[data-footer-context]:not([hidden])")
  const configuredTabs = {
    "assert-post": "Assert", "capture-post": "Capture",
    "create-post": "Pre Script", "get-user": "Post Script", "signed-request": "Pre Script", "chain-request": "Pre Script", "external-script": "Pre Script",
    "update-todo": "Tests", "schema-test": "Tests", "list-test": "Tests", "data-test": "Tests",
  }
  const fetches = () => view.performance.getEntriesByType("resource").filter((entry) => ["fetch", "xmlhttprequest"].includes(entry.initiatorType)).length
  const before = fetches()
  const theme = view.getComputedStyle(demo)
  const color = (role) => {
    const hex = theme.getPropertyValue(`--demo-${role}`).trim().slice(1)
    return `rgb(${[0, 2, 4].map((start) => parseInt(hex.slice(start, start + 2), 16)).join(", ")})`
  }
  assert(view.getComputedStyle(demo.querySelector(".terminal")).backgroundColor === color("background-panel"), "Terminal uses the theme panel background")
  assert(view.getComputedStyle(demo.querySelector(".variable")).color === color("primary"), "URL variables use primary, independently of accent")
  const ids = [...demo.querySelectorAll("[id]")].map((element) => element.id)
  assert(new Set(ids).size === ids.length, "All demo IDs are unique")
  assert([...demo.querySelectorAll("[data-request], [data-send], [role=tab], [data-footer-action], [data-footer-send], [data-add-tab]")].every((button) => !button.disabled), "Controls initialized")
  assert([...demo.querySelectorAll(".footer-context button:not([data-footer-action])")].every((button) => button.disabled), "App-only footer commands stay disabled")
  assert([...demo.querySelectorAll(".terminal select, button.tag-placeholder")].every((control) => control.disabled), "Read-only auth and settings controls stay disabled")
  const folders = [...demo.querySelectorAll(".request-folder")]
  assert(folders.map((folder) => folder.querySelector("summary").textContent.trim()).join(",") === "body templates,assertions & captures,authentication,scripts,tests,requests", "All six feature folders are present")
  assert(demo.querySelectorAll("[data-request]").length === 32, "All 32 focused request examples are present")
  for (const workspace of demo.querySelectorAll("[data-example]")) {
    assert(workspace.querySelectorAll('.request [role=tab].has-content:not([hidden])').length > 0, `${workspace.dataset.example}: demonstrates configured content`)
    assert([...workspace.querySelectorAll('.request [data-reveal-tab]')].filter((item) => item.disabled).length <= 1, `${workspace.dataset.example}: at most one optional tab is configured`)
  }
  const panelText = (id, tab) => demo.querySelector(`#demo-${id}-Request-${tab}`).textContent
  assert(panelText("capture-post", "Capture").includes("created_user_id") && panelText("use-captures", "Headers").includes("$response_content_type"), "Capture producer and consumer show shared variables")
  const captureTable = demo.querySelector('table[aria-label="Response captures"]')
  const captureRows = [...captureTable.querySelectorAll("tbody tr")]
  assert(captureTable.querySelector("thead").classList.contains("sr-only") && captureRows.every((row) => row.cells.length === 4 && row.querySelector(".checked-value")), "Capture rows match Noodle's checkbox, variable, expression, and persistence layout")
  assert(captureRows.every((row, index) => {
    const select = row.querySelector("select")
    return select.disabled && select.value === ["transient", "environment", "secret"][index] && [...select.options].map((option) => option.textContent).join(",") === "Run only,Secret,Environment"
  }), "Capture persistence selectors show one each of Run only, Environment, and Secret using Noodle's options")
  assert([...demo.querySelectorAll('#demo-capture-post-Response-Results .result-entry')].every((row, index) => {
    const persisted = [...row.querySelectorAll('dt')].find((label) => label.textContent === "Persisted")?.nextElementSibling?.textContent
    return persisted === [undefined, "environment", "secret"][index]
  }), "Capture results reflect each persistence destination")
  assert(!captureTable.closest('[role="tabpanel"]').querySelector(".network-note"), "Capture view omits the demo-only Runner note")
  assert(panelText("time-post", "Body").includes("$time.unix") && panelText("random-post", "Body").includes('$random.number({"min":1,"max":10})'), "Time and typed random templates remain literal")
  assert(panelText("external-script", "Pre-Script").includes("External file") && panelText("external-script", "Pre-Script").includes("./scripts/prepare-request.js"), "External source has its mode, path, and preview")
  assert(panelText("schema-test", "Tests").includes("toMatchSchema") && panelText("data-test", "Tests").includes("noodle.iteration?.data"), "Schema and data-driven tests are discoverable")
  assert(panelText("chain-request", "Pre-Script").includes("await noodle.runRequest") && panelText("signed-request", "Pre-Script").includes("noodle.crypto.hmacSha256"), "Async chaining and signing use supported APIs")
  assert(panelText("multipart-post", "Body").includes("./README.md") && panelText("binary-post", "Body").includes("File:"), "Multipart and binary examples expose file inputs")
  assert(![...demo.querySelectorAll(".sample-results dd")].some((item) => ["collection", "folder"].includes(item.textContent)), "Scripts have no inherited execution scopes")
  for (const folder of folders) {
    const wasOpen = folder.open
    folder.querySelector("summary").click()
    assert(folder.open !== wasOpen, "Folder toggles with its native summary")
    folder.querySelector("summary").click()
    assert(folder.open === wasOpen, "Folder can be toggled back")
  }

  for (const example of demo.querySelectorAll("[data-example]")) {
    const id = example.dataset.example
    const initialTab = example.querySelector(".request").dataset.defaultTab
    const status = example.dataset.status
    choice(id).closest("details").open = true
    choice(id).click()
    const workspace = active()
    assert(workspace.dataset.example === id, `${id}: request selection`)
    assert(footer().dataset.footerContext === "sidebar", `${id}: selecting a request shows sidebar shortcuts`)
    assert(demo.querySelectorAll('.pane.is-active').length === 1 && demo.querySelector('.collection').classList.contains('is-active'), `${id}: selecting a request highlights only the sidebar pane`)
    assert(demo.querySelectorAll('[data-request][aria-pressed="true"]').length === 1, `${id}: one selected request`)
    assert(workspace.querySelector('.request [aria-selected="true"]').textContent === initialTab, `${id}: default request tab`)
    assert(workspace.querySelector('.response [aria-selected="true"]').textContent === "Body", `${id}: response resets to Body`)
    assert(workspace.querySelector(".response-summary").textContent.includes(status), `${id}: completed response`)
    const response = JSON.parse(workspace.querySelector('[aria-label="Response body"] code').textContent)
    const size = new TextEncoder().encode(JSON.stringify(response, null, 2)).length
    const metrics = workspace.querySelector(".response-metrics")
    const badge = workspace.querySelector(".response-status")
    assert(metrics.textContent.startsWith(`${size < 1024 ? `${size}B` : `${(size / 1024).toFixed(1)}KB`} in `) && / in \d+ms$/.test(metrics.textContent), `${id}: native size and time formatting`)
    assert(view.getComputedStyle(metrics).backgroundColor === color("background-element") && view.getComputedStyle(metrics).color === color("text-muted"), `${id}: unfocused metrics use theme colors`)
    assert(view.getComputedStyle(badge).backgroundColor === color("success") && view.getComputedStyle(badge).color === color("background-panel"), `${id}: status badge uses semantic theme colors`)
    assert(Math.abs(metrics.getBoundingClientRect().right - badge.getBoundingClientRect().left) < 1, `${id}: response badges adjoin without a gap`)
    assert(view.getComputedStyle(metrics).fontSize === view.getComputedStyle(workspace.querySelector('.response .pane-title')).fontSize, `${id}: response metadata matches the title size`)
    if (initialTab === "Path") assert(workspace.querySelector('.request [role=tabpanel]:not([hidden]) td').textContent === "1", `${id}: path parameter value preserved`)

    for (const group of workspace.querySelectorAll("[data-group]")) {
      const tabs = [...group.querySelectorAll("[role=tab]")].filter((tab) => !tab.hidden)
      const expectedRequestTabs = ["Headers", "Params", "Path", "Body", "Auth", ...(configuredTabs[id] ? [configuredTabs[id]] : []), "Settings"]
      assert(tabs.map((tab) => tab.textContent).join(",") === (group.dataset.group === "Request" ? expectedRequestTabs.join(",") : "Body,Headers,Network,Timeline,Cookies,Results"), `${id}: configured ${group.dataset.group} tabs are visible`)
      for (const tab of tabs) {
        tab.click()
        const panel = doc.getElementById(tab.getAttribute("aria-controls"))
        assert(tab.getAttribute("aria-selected") === "true" && !panel.hidden && panel.textContent.trim(), `${id}: ${group.dataset.group} ${tab.textContent} tab`)
        assert(group.querySelectorAll('[role=tab][tabindex="0"]').length === 1 && group.querySelectorAll('[role=tabpanel]:not([hidden])').length === 1, `${id}: tab selection is exclusive`)
        if (id === "create") {
          const context = group.dataset.group === "Request" ? "request-base" : tab.textContent === "Body" ? "response-body" : tab.textContent === "Cookies" ? "response-cookies" : "response-base"
          assert(footer().dataset.footerContext === context, `${id}: ${group.dataset.group} ${tab.textContent} footer matches the selected tab`)
          panel.focus()
          if (group.dataset.group === "Response") await waitForStyle(() => view.getComputedStyle(metrics).color === color("text"))
          if (group.dataset.group === "Response") assert(view.getComputedStyle(metrics).color === color("text"), `${id}: focused response metrics use theme text`)
          const panelContext = group.dataset.group !== "Request" ? context : ["Headers", "Params"].includes(tab.textContent) ? "request-fields" : tab.textContent === "Path" ? "request-path" : tab.textContent === "Body" ? "request-body" : tab.textContent === "Assert" ? "request-assert" : "request-base"
          assert(footer().dataset.footerContext === panelContext, `${id}: ${tab.textContent} panel focus updates the shortcuts`)
          assert(group.classList.contains('is-active') && demo.querySelectorAll('.pane.is-active').length === 1, `${id}: ${tab.textContent} panel focus exclusively selects its pane`)
          const expand = footer().querySelector('[data-footer-action="expand"]')
          expand.focus()
          expand.click()
          assert(group.classList.contains("is-expanded") && doc.activeElement === expand, `${id}: footer expands the focused pane without moving focus`)
          expand.dispatchEvent(new view.KeyboardEvent("keydown", { key: "F2", bubbles: true }))
          assert(!group.classList.contains("is-expanded"), `${id}: F2 restores the pane`)
        }
        if (tab.textContent === "Timeline") {
          const content = panel.innerHTML
          panel.querySelector(".timeline-row").click()
          assert(panel.innerHTML === content && !panel.querySelector("details, button, [role=button]") && !demo.querySelector("dialog"), `${id}: timeline is a static row with no disclosure or modal`)
        }
        if (id === "cookie-request" && tab.textContent === "Cookies") {
          const table = panel.querySelector('table')
          const lineHeight = parseFloat(view.getComputedStyle(table).lineHeight)
          assert([...table.rows].every((row) => row.getBoundingClientRect().height <= lineHeight + 1), "Cookie headings and values fit on one line across all three columns")
          assert(panel.scrollWidth <= panel.clientWidth && panel.scrollHeight <= panel.clientHeight, "All cookie rows fit in the response pane without scrolling")
        }
        if (tab.textContent === "Results" && configuredTabs[id]) {
          const rows = [...panel.querySelectorAll(".result-entry")]
          assert(rows.length === ({ "assert-post": 4, "capture-post": 3, "update-todo": 2, "list-test": 2 }[id] ?? 1), `${id}: sample result count matches the configured checks`)
          rows[0].querySelector("summary").click()
          assert(rows[0].open && rows[0].querySelector("dl").textContent.trim(), `${id}: sample result details expand`)
          rows[0].querySelector("summary").click()
        }
        const strip = tab.parentElement
        assert(tab.offsetLeft >= strip.scrollLeft - 1 && tab.offsetLeft + tab.offsetWidth <= strip.scrollLeft + strip.clientWidth + 1, `${id}: selected ${tab.textContent} tab stays in view`)
      }
      tabs[0].focus()
      tabs[0].dispatchEvent(new view.KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }))
      assert(doc.activeElement === tabs.at(-1) && tabs.at(-1).getAttribute("aria-selected") === "true", `${id}: Left wraps and activates`)
      tabs.at(-1).dispatchEvent(new view.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }))
      assert(doc.activeElement === tabs[0], `${id}: Right wraps`)
      tabs[0].dispatchEvent(new view.KeyboardEvent("keydown", { key: "End", bubbles: true }))
      assert(doc.activeElement === tabs.at(-1), `${id}: End selects last tab`)
      tabs.at(-1).dispatchEvent(new view.KeyboardEvent("keydown", { key: "Home", bubbles: true }))
      assert(doc.activeElement === tabs[0], `${id}: Home selects first tab`)
    }
    const authType = workspace.querySelector('[aria-label="Authentication type"]').value
    assert(id.endsWith("-auth") ? authType !== "None" && workspace.querySelector('[id$="-Request-Auth"]').textContent.includes("$") : authType === "None", `${id}: configured auth or empty default`)
    assert(workspace.querySelector('[aria-label="TLS Verification"]').value === "Inherit (verify)", `${id}: collection TLS setting is inherited`)
    assert(workspace.querySelector('[data-tab="Cookies"]') && (id === "cookie-request" ? workspace.querySelector('[aria-label="Response cookies"]').textContent.includes("httpbin.org/") : workspace.querySelector('[id$="-Response-Cookies"]').textContent.trim() === "No cookies captured."), `${id}: native empty cookie state`)
    assert(configuredTabs[id] ? workspace.querySelector('[id$="-Response-Results"]').textContent.includes("Sample results") : workspace.querySelector('[id$="-Response-Results"]').textContent.trim() === "No execution results.", `${id}: matching sample results or native empty state`)
    const menuItems = [...workspace.querySelectorAll('[data-reveal-tab]')]
    assert(menuItems.map((item) => item.textContent).join(",") === "Assert,Capture,Pre Script,Post Script,Tests", `${id}: native optional-tab menu entries`)
    assert(menuItems.filter((item) => item.disabled).map((item) => item.textContent).join() === (configuredTabs[id] ?? ""), `${id}: configured tab is disabled in the add menu`)

    const send = workspace.querySelector("[data-send]")
    send.focus()
    send.click()
    send.click()
    assert(send.textContent === "Sending…" && send.getAttribute("aria-disabled") === "true", `${id}: pending send blocks repeats`)
    await wait()
    assert(send.textContent === "Send" && workspace.querySelector(".response").getAttribute("aria-busy") === "false", `${id}: send completes`)
    assert(doc.activeElement === send && live.textContent.includes(`${status}.`), `${id}: focus retained and completion announced`)
  }

  choice("get").click()
  const menuWorkspace = active()
  const add = menuWorkspace.querySelector('[data-add-tab]')
  const menu = menuWorkspace.querySelector('[data-tab-menu]')
  add.click()
  assert(!menu.hidden && doc.activeElement.dataset.revealTab === "Assert", "Plus opens the menu and focuses the first available item")
  doc.activeElement.dispatchEvent(new view.KeyboardEvent("keydown", { key: "End", bubbles: true }))
  assert(doc.activeElement.dataset.revealTab === "Tests", "Menu End selects its last item")
  doc.activeElement.dispatchEvent(new view.KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }))
  assert(doc.activeElement.dataset.revealTab === "Assert", "Menu Down wraps")
  doc.activeElement.dispatchEvent(new view.KeyboardEvent("keydown", { key: "Escape", bubbles: true }))
  assert(menu.hidden && doc.activeElement === add && add.getAttribute("aria-expanded") === "false", "Escape closes the menu and returns focus to Plus")
  for (const name of ["Assert", "Capture", "Pre Script", "Post Script", "Tests"]) {
    add.click()
    const item = menu.querySelector(`[data-reveal-tab="${name}"]`)
    item.click()
    const tab = menuWorkspace.querySelector(`.request [data-tab="${name}"]`)
    assert(!tab.hidden && tab.getAttribute("aria-selected") === "true" && doc.activeElement === tab && item.disabled && menu.hidden, `${name}: menu reveals, selects, and focuses the tab`)
    assert(doc.getElementById(tab.getAttribute("aria-controls")).textContent.includes("No "), `${name}: an unconfigured request keeps its empty state`)
    tab.dispatchEvent(new view.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }))
    assert(doc.activeElement.dataset.tab === "Settings", `${name}: revealed tab participates in arrow navigation`)
  }
  add.click()
  choice("get-user").click()
  assert(menu.hidden, "Changing requests dismisses the open menu")
  choice("get").click()
  assert([...menuWorkspace.querySelectorAll('.request [role=tab]')].every((tab) => !tab.hidden), "Revealed tabs persist only for that request")
  // Restore the empty request's hidden tabs so this check can be run again.
  for (const item of menu.querySelectorAll('[data-reveal-tab]')) {
    menuWorkspace.querySelector(`[data-tab="${item.dataset.revealTab}"]`).hidden = true
    item.disabled = false
  }

  choice("create").click()
  const body = active().querySelector('[aria-label="Request body"] code').textContent
  assert(body.includes('"name": $random.name') && body.includes('"email": $random.email'), "Template placeholders preserved as text")
  assert(active().querySelector('[data-tab="Body"]').classList.contains("has-content"), "Populated base tabs show Noodle's content indicator")
  choice("assert-post").click()
  assert(active().querySelector('[data-tab="Results"]').classList.contains("has-results"), "Completed checks show the Results indicator")
  active().querySelector('[data-tab="Assert"]').click()
  assert(active().querySelectorAll('.assertions select:disabled').length === 4, "Assertion operators use read-only dropdowns")
  active().querySelector('.response [data-tab="Results"]').click()
  assert(active().querySelector('.sample-results h3').textContent.includes("4 passed · 0 failed"), "Results use the app's pass/fail summary")
  const summaries = [...active().querySelectorAll('.result-entry summary')]
  assert(summaries.every((summary) => Math.abs(summary.querySelector('.result-meta').getBoundingClientRect().left - summaries[0].querySelector('.result-meta').getBoundingClientRect().left) < 1), "Result metadata aligns across rows")
  choice("update-todo").click()
  active().querySelector('[data-tab="Tests"]').click()
  const source = active().querySelector('.script-format select')
  assert(source.disabled && source.textContent === "Inline", "Scripts use Noodle's full-width Inline selector")
  assert(source.clientWidth >= source.parentElement.clientWidth - 1, "Script source selector fills the pane")
  const syntax = active().querySelector('.script-code')
  assert(view.getComputedStyle(syntax.querySelector('.function')).color !== view.getComputedStyle(syntax.querySelector('.constant')).color, "Function calls and boolean literals have distinct native colors")
  assert(view.getComputedStyle(syntax.querySelector('.number')).color !== view.getComputedStyle(syntax.querySelector('.constant')).color, "Numbers and boolean literals have distinct native colors")
  choice("create").click()
  active().querySelector("[data-send]").click()
  choice("get-user").click()
  await wait()
  assert(active().dataset.example === "get-user" && !live.textContent.includes("complete."), "Switching folders cancels a pending send")
  assert(demo.querySelector('#demo-api-key-auth-Request-Auth').textContent.includes("$api_key"), "API-key placeholder remains literal")
  assert(demo.querySelector('#demo-get-posts-Request-Params').textContent.includes("disabled"), "Disabled post query parameter is labeled")
  assert(!demo.querySelector('#demo-get-posts-Response-Network').textContent.includes("_sort"), "Disabled query parameter is absent from the sample URL")
  choice("create").click()
  assert(active().querySelector("[data-send]").textContent === "Send" && !active().querySelector(".response .panels").hidden, "Canceled request can be selected again")
  active().querySelector('.response [data-tab="Body"]').click()
  const footerSend = demo.querySelector('[data-footer-send]')
  footerSend.focus()
  footerSend.click()
  footerSend.click()
  assert(footerSend.getAttribute("aria-disabled") === "true" && footer().querySelector('[data-footer-action="copy"]').getAttribute("aria-disabled") === "true", "Footer Send blocks repeats and disables copy while pending")
  await wait()
  assert(footerSend.getAttribute("aria-disabled") === "false" && footer().dataset.footerContext === "response-body" && doc.activeElement === footerSend, "Footer Send restores response hints and retains focus")
  const responsePanel = active().querySelector('.response [role="tabpanel"]:not([hidden])')
  responsePanel.focus()
  responsePanel.dispatchEvent(new view.KeyboardEvent("keydown", { key: "Enter", ctrlKey: true, bubbles: true }))
  assert(doc.activeElement === responsePanel && footerSend.getAttribute("aria-disabled") === "true", "Ctrl+Enter sends without hiding the focused response panel")
  await wait()
  assert(doc.activeElement === responsePanel && live.textContent.includes("complete."), "Keyboard Send preserves focus through completion")
  footer().querySelector('[data-footer-action="expand"]').click()
  choice("get-user").click()
  assert(!demo.querySelector('.workspace.is-expanded'), "Changing requests restores the normal pane layout")
  choice("create").click()
  folders.forEach((folder) => { folder.open = !["authentication", "requests"].includes(folder.querySelector("summary").textContent.trim()) })
  const picker = doc.querySelector("[data-theme-picker]")
  const themeOptions = [...doc.querySelectorAll("[data-theme-option]")]
  const originalTheme = doc.documentElement.dataset.siteTheme
  assert(!picker.disabled && themeOptions.length === 8, "All eight themes are available in the palette menu")
  assert(themeOptions.map((option) => option.dataset.themeOption).join(",") === "noodle,aura,carbonfox,catppuccin,claude-code,cobalt2,dracula,synthwave84", "Theme names and order match Noodle")
  choice("create-post").click()
  active().querySelector('.request [data-tab="Body"]').click()
  active().querySelector('.response [data-tab="Headers"]').click()
  const requestPanel = active().querySelector('.request [role=tabpanel]:not([hidden])')
  const tree = demo.querySelector(".request-tree")
  requestPanel.scrollTop = 60
  tree.scrollTop = 48
  picker.focus()
  const preserved = () => JSON.stringify({
    example: active().dataset.example,
    tabs: [...active().querySelectorAll('[role=tab][aria-selected="true"]')].map((tab) => tab.id),
    folders: folders.map((folder) => folder.open),
    requestScroll: requestPanel.scrollTop,
    treeScroll: tree.scrollTop,
    pageScroll: view.scrollY,
    selectedPane: demo.querySelector('.pane.is-active')?.getAttribute('aria-label'),
  })
  const state = preserved()
  for (const option of themeOptions) {
    option.click()
    await waitForStyle(() => view.getComputedStyle(demo.querySelector(".terminal")).backgroundColor === color("background-panel"))
    assert(doc.documentElement.dataset.siteTheme === option.dataset.themeOption, `${option.dataset.themeOption}: theme applied`)
    assert(preserved() === state && doc.activeElement === picker, `${option.dataset.themeOption}: request, tabs, folders, scroll, and focus preserved`)
    assert(view.getComputedStyle(demo.querySelector(".terminal")).backgroundColor === color("background-panel"), `${option.dataset.themeOption}: panel palette updated`)
    assert(view.getComputedStyle(active().querySelector(".response-status")).backgroundColor === color("success"), `${option.dataset.themeOption}: response badge palette updated`)
    assert(view.getComputedStyle(active().querySelector(".variable")).color === color("primary"), `${option.dataset.themeOption}: URL palette updated`)
    assert(view.getComputedStyle(active().querySelector(".key")).color === color("secondary"), `${option.dataset.themeOption}: syntax palette updated`)
    const arrow = decodeURIComponent(view.getComputedStyle(active().querySelector(".demo-select")).backgroundImage)
    assert(arrow.includes(theme.getPropertyValue("--demo-text-muted").trim()), `${option.dataset.themeOption}: dropdown arrow palette updated`)
  }
  picker.dispatchEvent(new view.KeyboardEvent("keydown", { key: "F2", bubbles: true }))
  picker.dispatchEvent(new view.KeyboardEvent("keydown", { key: "Enter", ctrlKey: true, bubbles: true }))
  assert(!demo.querySelector('.workspace.is-expanded') && active().querySelector('[data-send]').textContent === "Send", "Theme picker does not trigger terminal shortcuts")
  active().querySelector('[data-send]').click()
  themeOptions.find((option) => option.dataset.themeOption === originalTheme).click()
  assert(active().querySelector('[data-send]').textContent === "Sending…", "Changing themes preserves a pending send")
  await wait()
  assert(active().querySelector('[data-send]').textContent === "Send" && live.textContent.includes("complete."), "Pending send finishes after changing themes")
  choice("create").click()
  tree.scrollTop = 0
  assert(fetches() === before, "Demo interactions made no fetch/XHR requests")
  return { passed: checks.length, checks }
}

async function checkNoodleTour(doc = document) {
  const demo = doc.querySelector("[data-noodle-demo]")
  const view = doc.defaultView
  const checks = []
  const assert = (condition, message) => {
    if (!condition) throw new Error(message)
    checks.push(message)
  }
  const chapters = [...demo.querySelectorAll("[data-tour-chapter]")]
  const select = demo.querySelector("[data-tour-select]")
  const play = demo.querySelector("[data-tour-play]")
  const previous = demo.querySelector("[data-tour-previous]")
  const next = demo.querySelector("[data-tour-next]")
  const progress = demo.querySelector("[data-tour-progress]")
  const active = () => demo.querySelector("[data-example]:not([hidden])")
  const choose = (id) => { select.value = id; select.dispatchEvent(new view.Event("change", { bubbles: true })) }
  assert(chapters.length === 22 && !select.disabled && !play.disabled, "22 guided chapters initialize")
  select.focus({ preventScroll: true })
  const scroll = view.scrollY
  const height = demo.getBoundingClientRect().height
  for (const chapter of chapters) {
    choose(chapter.dataset.tourChapter)
    const workspace = active()
    const request = demo.querySelector(`[data-request="${chapter.dataset.tourChapter}"]`)
    const tree = demo.querySelector(".request-tree").getBoundingClientRect()
    const row = request.getBoundingClientRect()
    assert(workspace.dataset.example === chapter.dataset.tourChapter && request.getAttribute("aria-pressed") === "true", `${select.value}: chapter selects its request`)
    assert(request.closest("details").open && demo.querySelectorAll(".request-folder[open]").length === 1, `${select.value}: matching folder is open`)
    assert(row.top >= tree.top - 1 && row.bottom <= tree.bottom + 1, `${select.value}: selected request is visible in the sidebar`)
    assert(workspace.querySelector('.request [aria-selected="true"]').dataset.tab === workspace.querySelector(".request").dataset.defaultTab, `${select.value}: relevant request tab is selected`)
    assert(workspace.querySelector('.response [aria-selected="true"]').dataset.tab === chapter.dataset.responseTab, `${select.value}: relevant response tab is selected`)
    assert(demo.querySelectorAll('.pane.is-active').length === 1 && workspace.querySelector(chapter.dataset.responseTab === "Body" ? ".request" : ".response").classList.contains("is-active"), `${select.value}: the demonstrated pane stays selected while the chapter control has keyboard focus`)
    assert(chapter.getAttribute("aria-hidden") === "false" && demo.querySelectorAll('.tour-copy [aria-hidden="false"]').length === 1, `${select.value}: one matching explanation is exposed`)
    assert(Math.abs(demo.getBoundingClientRect().height - height) < 1 && view.scrollY === scroll && doc.activeElement === select, `${select.value}: chapter changes preserve layout, page scroll, and focus`)
    assert(play.textContent === "Play", `${select.value}: chapter selection pauses playback`)
  }
  assert(next.disabled && !previous.disabled, "Last chapter disables Next")
  previous.click()
  assert(select.value === chapters.at(-2).dataset.tourChapter, "Previous selects the preceding chapter")
  assert(play.textContent === "Play" && !progress.getAnimations().length, "Previous preserves explicitly paused playback")
  next.click()
  assert(select.value === chapters.at(-1).dataset.tourChapter, "Next selects the following chapter")
  assert(play.textContent === "Play" && !progress.getAnimations().length, "Next preserves explicitly paused playback")
  choose(chapters[0].dataset.tourChapter)
  assert(previous.disabled && !next.disabled, "First chapter disables Previous")
  play.click()
  assert(play.textContent === "Pause", "Play starts playback")
  assert(active().querySelector('.request').classList.contains('is-active'), "Play selects the demonstrated pane")
  for (const button of [next, previous]) {
    const oldProgress = progress.getAnimations()[0]
    oldProgress.currentTime = 6000
    button.click()
    const restarted = progress.getAnimations()[0]
    assert(play.textContent === "Pause", `${button.textContent}: chapter navigation keeps playback running`)
    assert(active().querySelector('.request').classList.contains('is-active') && demo.querySelectorAll('.pane.is-active').length === 1, `${button.textContent}: chapter navigation preserves a single selected pane`)
    assert(oldProgress.playState === "idle" && restarted?.playState === "running" && restarted.currentTime === 0, `${button.textContent}: chapter navigation restarts progress from zero`)
    assert(restarted.effect.getTiming().duration === Number(chapters.find((chapter) => chapter.dataset.tourChapter === select.value).dataset.duration), `${button.textContent}: restarted progress uses the selected chapter duration`)
  }
  play.click()
  assert(play.textContent === "Play", "Pause stops playback")
  play.click()
  for (const event of ["pointerover", "pointerdown", "keydown", "focusin", "wheel", "click"]) {
    active().querySelector('.request [role=tabpanel]:not([hidden])').dispatchEvent(new view.Event(event, { bubbles: true }))
    assert(play.textContent === "Pause", `${event}: passive interaction keeps playback running`)
  }
  active().querySelector('.request [data-tab="Headers"]').click()
  assert(play.textContent === "Play", "Selecting a tab pauses playback")
  play.click()
  active().querySelector('.request [aria-selected="true"]').dispatchEvent(new view.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }))
  assert(play.textContent === "Play", "Keyboard tab navigation pauses playback")
  play.click()
  select.dispatchEvent(new view.Event("pointerdown", { bubbles: true }))
  assert(play.textContent === "Play", "Opening the chapter selector pauses playback")
  play.click()
  select.dispatchEvent(new view.KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }))
  assert(play.textContent === "Play", "Keyboard chapter selection pauses playback")
  for (const selector of ['.request-folder summary', '[data-add-tab]']) {
    play.click()
    const control = selector.includes("folder") ? demo.querySelector(selector) : active().querySelector(selector)
    control.click()
    assert(play.textContent === "Play", `${selector}: opening navigation pauses playback`)
  }
  play.click()
  demo.querySelector('[data-request="basic-auth"]').click()
  assert(play.textContent === "Play", "Selecting a request pauses playback")
  assert(select.value === "" && demo.querySelector('[data-tour-explore]').getAttribute("aria-hidden") === "false", "Manual exploration outside the tour has its own explanation")
  play.click()
  assert(active().dataset.example === chapters[0].dataset.tourChapter && select.value === chapters[0].dataset.tourChapter, "Play returns from exploration to the current chapter")
  play.click()
  const durations = chapters.map((chapter) => chapter.dataset.duration)
  const waitFor = async (condition) => {
    const deadline = view.performance.now() + 2000
    while (!condition()) {
      if (view.performance.now() > deadline) throw new Error("Timed out waiting for tour playback")
      await new Promise((resolve) => view.requestAnimationFrame(resolve))
    }
  }
  try {
    demo.scrollIntoView({ block: "center", behavior: "instant" })
    // Let the browser deliver intersection changes before testing its timers.
    await new Promise((resolve) => view.requestAnimationFrame(() => view.requestAnimationFrame(resolve)))
    chapters.forEach((chapter) => { chapter.dataset.duration = "100" })
    play.click()
    await waitFor(() => progress.getAnimations().some((animation) => animation.playState === "running"))
    assert(progress.getAnimations()[0]?.effect.getTiming().duration === Number(chapters[0].dataset.duration), "Progress uses the same duration as the chapter timer")
    await waitFor(() => select.value === chapters[1].dataset.tourChapter)
    assert(active().querySelector('.request').classList.contains('is-active') && demo.querySelectorAll('.pane.is-active').length === 1, "Automatic advance selects a pane in the new example")
    play.click()
    const pausedProgress = progress.getAnimations()[0]
    await pausedProgress.ready
    const pausedTime = pausedProgress.currentTime
    const paused = select.value
    await new Promise((resolve) => view.setTimeout(resolve, 250))
    assert(select.value === paused, "Paused playback cancels its pending advance")
    assert(pausedProgress.playState === "paused" && pausedProgress.currentTime === pausedTime, "Progress freezes with paused playback")
    choose(chapters.at(-1).dataset.tourChapter)
    play.click()
    await waitFor(() => select.value === chapters[0].dataset.tourChapter)
    assert(play.textContent === "Pause", "Tour loops from its last chapter to its first without stopping")
    play.click()
    assert(play.textContent === "Play", "Pause still stops a looping tour")
  } finally {
    if (play.textContent === "Pause") play.click()
    chapters.forEach((chapter, index) => { chapter.dataset.duration = durations[index] })
  }
  return { passed: checks.length, checks }
}
