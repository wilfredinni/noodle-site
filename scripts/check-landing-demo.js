// At a viewport of at least 680px, paste this file into the landing page's browser console, then run:
// await checkNoodleDemo()
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
  const choice = (id) => demo.querySelector(`[data-request="${id}"]`)
  const active = () => demo.querySelector("[data-example]:not([hidden])")
  const live = demo.querySelector("[data-demo-status]")
  const footer = () => demo.querySelector("[data-footer-context]:not([hidden])")
  const fetches = () => view.performance.getEntriesByType("resource").filter((entry) => ["fetch", "xmlhttprequest"].includes(entry.initiatorType)).length
  const before = fetches()
  const ids = [...demo.querySelectorAll("[id]")].map((element) => element.id)
  assert(new Set(ids).size === ids.length, "All demo IDs are unique")
  assert([...demo.querySelectorAll("[data-request], [data-send], [role=tab], [data-footer-action], [data-footer-send]")].every((button) => !button.disabled), "Controls initialized")
  assert([...demo.querySelectorAll(".footer-context button:not([data-footer-action])")].every((button) => button.disabled), "App-only footer commands stay disabled")
  assert([...demo.querySelectorAll("select, .tag-placeholder")].every((control) => control.disabled), "Read-only auth and settings controls stay disabled")
  const folders = [...demo.querySelectorAll(".request-folder")]
  assert(folders.map((folder) => folder.querySelector("summary").textContent.trim()).join(",") === "comments,posts,todos,users", "All four collection folders are present")
  assert(demo.querySelectorAll("[data-request]").length === 18, "All 18 request examples are present")
  for (const folder of folders) {
    const wasOpen = folder.open
    folder.querySelector("summary").click()
    assert(folder.open !== wasOpen, "Folder toggles with its native summary")
    folder.querySelector("summary").click()
    assert(folder.open === wasOpen, "Folder can be toggled back")
  }

  for (const [id, method, initialTab, status, responseId] of [
    ["create", "POST", "Body", "201 Created", 501],
    ["get", "GET", "Path", "200 OK", 1],
    ["update", "PATCH", "Body", "200 OK", 1],
    ["get-user", "GET", "Path", "200 OK", 1],
    ["get-users", "GET", "Headers", "200 OK", 1],
    ["create-todo", "POST", "Body", "201 Created", 201],
    ["delete-todo", "DELETE", "Path", "200 OK", undefined],
    ["get-todo", "GET", "Path", "200 OK", 1],
    ["get-todos-by-user", "GET", "Path", "200 OK", 1],
    ["get-todos", "GET", "Headers", "200 OK", 1],
    ["update-todo", "PATCH", "Body", "200 OK", 1],
    ["create-post", "POST", "Body", "201 Created", 101],
    ["delete-post", "DELETE", "Path", "200 OK", undefined],
    ["get-post", "GET", "Path", "200 OK", 1],
    ["get-posts-by-user", "GET", "Path", "200 OK", 1],
    ["get-posts", "GET", "Headers", "200 OK", 1],
    ["put-post", "PUT", "Body", "200 OK", 1],
    ["update-post", "PATCH", "Body", "200 OK", 1],
  ]) {
    choice(id).closest("details").open = true
    choice(id).click()
    const workspace = active()
    assert(workspace.dataset.example === id, `${id}: request selection`)
    assert(footer().dataset.footerContext === "sidebar", `${id}: selecting a request shows sidebar shortcuts`)
    assert(demo.querySelectorAll('[data-request][aria-pressed="true"]').length === 1, `${id}: one selected request`)
    assert(workspace.querySelector(".method-badge").textContent === method, `${id}: method`)
    assert(workspace.querySelector('.request [aria-selected="true"]').textContent === initialTab, `${id}: default request tab`)
    assert(workspace.querySelector('.response [aria-selected="true"]').textContent === "Body", `${id}: response resets to Body`)
    assert(workspace.querySelector(".response-summary").textContent.includes(status), `${id}: completed response`)
    const response = JSON.parse(workspace.querySelector('[aria-label="Response body"] code').textContent)
    assert((Array.isArray(response) ? response[0] : response).id === responseId, `${id}: valid JSON fixture`)
    if (initialTab === "Path") assert(workspace.querySelector('.request [role=tabpanel]:not([hidden]) td').textContent === "1", `${id}: path parameter value preserved`)

    for (const group of workspace.querySelectorAll("[data-group]")) {
      const tabs = [...group.querySelectorAll("[role=tab]")]
      assert(tabs.map((tab) => tab.textContent).join(",") === (group.dataset.group === "Request" ? "Headers,Params,Path,Body,Auth,Settings" : "Body,Headers,Network,Timeline,Cookies,Results"), `${id}: all six ${group.dataset.group} tabs are present`)
      for (const tab of tabs) {
        tab.click()
        const panel = doc.getElementById(tab.getAttribute("aria-controls"))
        assert(tab.getAttribute("aria-selected") === "true" && !panel.hidden && panel.textContent.trim(), `${id}: ${group.dataset.group} ${tab.textContent} tab`)
        assert(group.querySelectorAll('[role=tab][tabindex="0"]').length === 1 && group.querySelectorAll('[role=tabpanel]:not([hidden])').length === 1, `${id}: tab selection is exclusive`)
        if (id === "create") {
          const context = group.dataset.group === "Request" ? "request-base" : tab.textContent === "Body" ? "response-body" : tab.textContent === "Cookies" ? "response-cookies" : "response-base"
          assert(footer().dataset.footerContext === context, `${id}: ${group.dataset.group} ${tab.textContent} footer matches the selected tab`)
          panel.focus()
          const panelContext = group.dataset.group !== "Request" ? context : ["Headers", "Params"].includes(tab.textContent) ? "request-fields" : tab.textContent === "Path" ? "request-path" : tab.textContent === "Body" ? "request-body" : "request-base"
          assert(footer().dataset.footerContext === panelContext, `${id}: ${tab.textContent} panel focus updates the shortcuts`)
          const expand = footer().querySelector('[data-footer-action="expand"]')
          expand.focus()
          expand.click()
          assert(group.classList.contains("is-expanded") && doc.activeElement === expand, `${id}: footer expands the focused pane without moving focus`)
          expand.dispatchEvent(new view.KeyboardEvent("keydown", { key: "F2", bubbles: true }))
          assert(!group.classList.contains("is-expanded"), `${id}: F2 restores the pane`)
        }
        if (tab.textContent === "Timeline") {
          const timeline = panel.querySelector(".timeline-entry")
          timeline.querySelector("summary").click()
          assert(timeline.open && timeline.querySelector(".timeline-details").textContent.includes(status), `${id}: sample timeline details open`)
          timeline.querySelector("summary").click()
          assert(!timeline.open, `${id}: sample timeline details close`)
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
    assert(workspace.querySelector('[aria-label="Authentication type"]').value === "None", `${id}: collection auth default is None`)
    assert(workspace.querySelector('[aria-label="TLS Verification"]').value === "Inherit (verify)", `${id}: collection TLS setting is inherited`)
    assert(workspace.querySelector('[data-tab="Cookies"]') && workspace.querySelector('[id$="-Response-Cookies"]').textContent.trim() === "No cookies captured.", `${id}: native empty cookie state`)
    assert(workspace.querySelector('[id$="-Response-Results"]').textContent.trim() === "No execution results.", `${id}: native empty execution state`)

    const send = workspace.querySelector("[data-send]")
    send.focus()
    send.click()
    send.click()
    assert(send.textContent === "Sending…" && send.getAttribute("aria-disabled") === "true", `${id}: pending send blocks repeats`)
    await wait()
    assert(send.textContent === "Send" && workspace.querySelector(".response").getAttribute("aria-busy") === "false", `${id}: send completes`)
    assert(doc.activeElement === send && live.textContent.includes(`${status}.`), `${id}: focus retained and completion announced`)
  }

  choice("create").click()
  const body = active().querySelector('[aria-label="Request body"] code').textContent
  assert(body.includes('"id": $random.uuid') && body.includes('"timestamp": $time.iso'), "Template placeholders preserved as text")
  active().querySelector("[data-send]").click()
  choice("get-user").click()
  await wait()
  assert(active().dataset.example === "get-user" && !live.textContent.includes("complete."), "Switching folders cancels a pending send")
  assert(demo.querySelector('#demo-create-post-Request-Headers').textContent.includes("$x_api_key"), "Post API-key placeholder remains literal")
  assert(demo.querySelector('#demo-delete-post-Request-Params').textContent.includes("disabled"), "Disabled post query parameter is labeled")
  assert(!demo.querySelector('#demo-delete-post-Response-Network').textContent.includes("val2"), "Disabled query parameter is absent from the sample URL")
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
  folders.forEach((folder) => { folder.open = ["posts", "todos"].includes(folder.querySelector("summary").textContent.trim()) })
  assert(fetches() === before, "Demo interactions made no fetch/XHR requests")
  return { passed: checks.length, checks }
}
