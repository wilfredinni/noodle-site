import { contrast, themeVariables } from "../../lib/themes"
import { demoThemes } from "./noodle-demo-themes"

export function initAppExamples(demo: HTMLElement, navigate: (target: string) => void, pause: () => void, announce: (message: string) => void) {
  const surfaces = [...demo.querySelectorAll<HTMLElement>("[data-app-surface]")]
  for (const surface of surfaces.filter((surface) => surface.classList.contains("picker-backdrop"))) {
    demo.querySelector(".terminal")!.append(surface)
  }
  let committedTheme: string | undefined
  const applyTheme = (name = committedTheme) => {
    const theme = demoThemes.find((theme) => theme.name === (name ?? document.documentElement.dataset.siteTheme))!
    const variables = themeVariables(theme)
    for (const [key, value] of Object.entries(variables)) {
      if (name) demo.style.setProperty(key, value)
      else demo.style.removeProperty(key)
    }
    const ink = (color: string) => contrast(color, "#1a1a1a") >= contrast(color, "#f0f0f0") ? "#1a1a1a" : "#f0f0f0"
    demo.style.setProperty("--demo-picker-ink", ink(theme.primary))
    demo.style.setProperty("--demo-secondary-ink", ink(theme.secondary))
  }
  applyTheme()

  for (const surface of surfaces.filter((surface) => surface.querySelector("[data-picker-search]"))) {
    const input = surface.querySelector<HTMLInputElement>("[data-picker-search]")!
    const options = [...surface.querySelectorAll<HTMLButtonElement>("[data-picker-option]")]
    if (surface.dataset.appSurface === "env-picker") options.push(options.shift()!)
    const empty = surface.querySelector<HTMLElement>("[data-picker-empty]")!
    const highlight = (option: HTMLButtonElement | undefined) => {
      options.forEach((item) => item.setAttribute("aria-selected", String(item === option)))
      if (option) {
        input.setAttribute("aria-activedescendant", option.id)
        option.scrollIntoView({ block: "nearest" })
        if (option.dataset.demoTheme) applyTheme(option.dataset.demoTheme)
      } else {
        input.removeAttribute("aria-activedescendant")
        if (surface.dataset.appSurface === "themes") applyTheme()
      }
    }
    const filter = () => {
      const terms = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean)
      options.forEach((option) => { option.hidden = !option.hasAttribute("data-picker-action") && !terms.every((term) => option.dataset.search!.includes(term)) })
      surface.querySelectorAll<HTMLElement>("[data-picker-section]").forEach((section) => {
        section.hidden = !section.querySelector("[data-picker-option]:not([hidden])")
      })
      const visible = options.filter((option) => !option.hidden && !option.hasAttribute("data-picker-action"))
      empty.hidden = visible.length > 0
      highlight(visible[0])
      announce(`${visible.length} ${surface.dataset.appSurface === "themes" ? "themes" : "results"} found.`)
    }
    input.addEventListener("input", () => { pause(); filter() })
    surface.addEventListener("keydown", (event) => {
      const visible = options.filter((option) => !option.hidden)
      const index = visible.findIndex((option) => option.getAttribute("aria-selected") === "true")
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault()
        pause()
        highlight(visible[(index + (event.key === "ArrowDown" ? 1 : -1) + visible.length) % visible.length])
      } else if (event.key === "Enter" && !event.ctrlKey && !event.metaKey && !event.altKey && event.target === input) {
        event.preventDefault()
        visible[index]?.click()
      }
    })
    options.forEach((option) => {
      option.addEventListener("pointermove", () => highlight(option))
      option.addEventListener("focus", () => highlight(option))
      option.addEventListener("click", () => {
        pause()
        if (option.dataset.pickerEnvironment) {
          demo.querySelector<HTMLButtonElement>(`[data-demo-env="${option.dataset.pickerEnvironment}"]`)!.click()
          navigate("close")
        } else if (option.dataset.demoTheme) {
          committedTheme = option.dataset.demoTheme
          announce(`${committedTheme} selected for the demo.`)
          navigate("close")
        } else if (option.dataset.findFolder) {
          const choice = demo.querySelector<HTMLButtonElement>(`[data-request]`)!
          const folder = [...demo.querySelectorAll<HTMLDetailsElement>(".request-folder")].find((folder) => folder.querySelector("summary")!.textContent!.trim() === option.dataset.findFolder)!
          navigate(folder.querySelector<HTMLButtonElement>("[data-request]")?.dataset.request ?? choice.dataset.request!)
          folder.open = true
          folder.querySelector<HTMLElement>("summary")!.focus()
        } else navigate(option.dataset.appTarget!)
      })
    })
    surface.addEventListener("demo:activate", () => {
      input.value = ""
      filter()
      if (surface.dataset.appSurface === "themes") {
        const name = committedTheme ?? document.documentElement.dataset.siteTheme
        options.forEach((option) => {
          const current = option.dataset.demoTheme === name
          option.dataset.current = String(current)
          option.querySelector(".theme-current")!.textContent = current ? "●" : ""
        })
        highlight(options.find((option) => option.dataset.demoTheme === name))
      } else if (surface.dataset.appSurface === "env-picker") {
        const name = demo.querySelector<HTMLButtonElement>('[data-demo-env][aria-pressed="true"]')!.dataset.demoEnv
        options.filter((option) => option.dataset.pickerEnvironment).forEach((option) => {
          option.dataset.current = String(option.dataset.pickerEnvironment === name)
          option.querySelector(".theme-current")!.textContent = option.dataset.current === "true" ? "●" : ""
        })
        highlight(options.find((option) => option.dataset.pickerEnvironment === name))
      }
    })
  }

  const remaskSecrets = () => {
    demo.querySelectorAll<HTMLButtonElement>("[data-env-reveal]").forEach((button) => {
      button.setAttribute("aria-pressed", "false")
      button.closest("tr")!.querySelector<HTMLInputElement>("[data-env-value]")!.value = "••••••••"
    })
  }
  demo.querySelectorAll<HTMLButtonElement>("[data-demo-env]").forEach((button) => button.addEventListener("click", () => {
    pause()
    remaskSecrets()
    const name = button.dataset.demoEnv!
    demo.querySelector<HTMLElement>("[data-active-environment]")!.textContent = name
    demo.querySelectorAll<HTMLElement>("[data-env-panel]").forEach((panel) => { panel.hidden = panel.dataset.envPanel !== name })
    demo.querySelectorAll<HTMLElement>("[data-demo-env]").forEach((choice) => choice.setAttribute("aria-pressed", String(choice === button)))
    const panel = demo.querySelector<HTMLElement>(`[data-env-panel="${name}"]`)!
    demo.querySelector<HTMLInputElement>("[data-env-name]")!.value = panel.dataset.envDraftName ?? name
    const color = panel.dataset.envDraftColor ?? (name === "development" ? "success" : name === "staging" ? "warning" : "error")
    const colorControl = demo.querySelector<HTMLInputElement>("[data-env-color]")!
    colorControl.value = color
    colorControl.closest<HTMLElement>("[data-native-select]")!.style.setProperty("--env-badge", `var(--demo-${color === "none" ? "background-element" : color})`)
    colorControl.dispatchEvent(new Event("demo:select-sync"))
    announce(`${name} sample variables selected.`)
  }))
  const wireVariableRow = (row: HTMLElement) => {
    const toggle = row.querySelector<HTMLButtonElement>("[data-env-toggle]")!
    toggle.addEventListener("click", () => {
      pause()
      const enabled = toggle.getAttribute("aria-pressed") !== "true"
      toggle.setAttribute("aria-pressed", String(enabled))
      toggle.querySelector("span")!.textContent = enabled ? "[x]" : "[ ]"
      row.classList.toggle("env-disabled", !enabled)
    })
    const reveal = row.querySelector<HTMLButtonElement>("[data-env-reveal]")
    const input = row.querySelector<HTMLInputElement>("[data-env-value]")!
    reveal?.addEventListener("click", () => {
      pause()
      const show = reveal.getAttribute("aria-pressed") !== "true"
      remaskSecrets()
      input.value = show ? input.dataset.envSecret! : "••••••••"
      reveal.setAttribute("aria-pressed", String(show))
    })
    input.addEventListener("focus", () => {
      if (input.dataset.envSecret !== undefined) {
        remaskSecrets()
        input.value = input.dataset.envSecret
        input.select()
        reveal!.setAttribute("aria-pressed", "true")
      }
    })
    input.addEventListener("input", () => {
      pause()
      if (input.dataset.envSecret !== undefined) input.dataset.envSecret = input.value
    })
  }
  demo.querySelectorAll<HTMLElement>("[data-env-toggle]").forEach((toggle) => wireVariableRow(toggle.closest("tr")!))
  demo.querySelectorAll<HTMLElement>("[data-env-add]").forEach((addRow) => {
    const key = addRow.querySelector<HTMLInputElement>("[data-env-add-key]")!
    const value = addRow.querySelector<HTMLInputElement>("[data-env-add-value]")!
    const submit = addRow.querySelector<HTMLButtonElement>("[data-env-add-submit]")!
    const add = () => {
      if (!key.value.trim()) return
      pause()
      const row = addRow.parentElement!.querySelector("tr")!.cloneNode(true) as HTMLElement
      row.classList.remove("env-disabled")
      row.querySelector("th")!.textContent = key.value.trim()
      const input = row.querySelector<HTMLInputElement>("[data-env-value]")!
      input.value = value.value
      input.setAttribute("aria-label", `${key.value.trim()} value`)
      const toggle = row.querySelector<HTMLButtonElement>("[data-env-toggle]")!
      toggle.setAttribute("aria-pressed", "true")
      toggle.setAttribute("aria-label", `Enable ${key.value.trim()}`)
      toggle.querySelector("span")!.textContent = "[x]"
      addRow.before(row)
      wireVariableRow(row)
      key.value = value.value = ""
      submit.disabled = true
      key.focus()
      announce("Sample variable added.")
    }
    addRow.addEventListener("input", () => { pause(); submit.disabled = !key.value.trim() })
    submit.addEventListener("click", add)
    addRow.addEventListener("keydown", (event) => { if (event.key === "Enter" && !event.ctrlKey && !event.metaKey && !event.altKey) { event.preventDefault(); add() } })
  })
  demo.addEventListener("focusin", (event) => {
    const target = event.target as HTMLElement
    if (target.closest('[data-app-surface="environments"]') && !target.closest(".env-variables")) remaskSecrets()
  })
  demo.querySelector<HTMLInputElement>("[data-env-name]")!.addEventListener("input", (event) => {
    pause()
    const panel = demo.querySelector<HTMLElement>("[data-env-panel]:not([hidden])")!
    panel.dataset.envDraftName = (event.target as HTMLInputElement).value
    demo.querySelector(`[data-demo-env="${panel.dataset.envPanel}"] span:last-child`)!.textContent = panel.dataset.envDraftName
  })
  demo.querySelector<HTMLInputElement>("[data-env-color]")!.addEventListener("change", (event) => {
    pause()
    remaskSecrets()
    const control = event.target as HTMLInputElement
    const panel = demo.querySelector<HTMLElement>("[data-env-panel]:not([hidden])")!
    panel.dataset.envDraftColor = control.value
    control.closest<HTMLElement>("[data-native-select]")!.style.setProperty("--env-badge", `var(--demo-${control.value === "none" ? "background-element" : control.value})`)
    demo.querySelector<HTMLElement>(`[data-demo-env="${panel.dataset.envPanel}"] .env-dot`)!.style.color = `var(--demo-${control.value === "none" ? "text-muted" : control.value})`
  })

  demo.querySelectorAll<HTMLElement>("[data-native-select]").forEach((select) => {
    const value = select.querySelector<HTMLInputElement>('input[type="hidden"]')!
    const trigger = select.querySelector<HTMLButtonElement>("[data-select-trigger]")!
    const menu = select.querySelector<HTMLElement>("[popover]")!
    const options = [...select.querySelectorAll<HTMLButtonElement>("[data-native-select-option]")]
    const sync = () => {
      options.forEach((option) => option.setAttribute("aria-checked", String(option.dataset.nativeSelectOption === value.value)))
      trigger.querySelector("[data-native-select-label]")!.textContent = options.find((option) => option.dataset.nativeSelectOption === value.value)!.querySelector("span")!.textContent
      if (value.hasAttribute("data-env-color")) select.style.setProperty("--env-ink", value.value === "none" ? "var(--demo-text)" : "var(--demo-picker-ink)")
    }
    value.addEventListener("demo:select-sync", sync)
    value.addEventListener("change", sync)
    options.forEach((option) => option.addEventListener("click", () => {
      pause()
      value.value = option.dataset.nativeSelectOption!
      value.dispatchEvent(new Event("change", { bubbles: true }))
    }))
    menu.addEventListener("toggle", () => {
      if (!menu.matches(":popover-open")) return
      const rect = trigger.getBoundingClientRect()
      menu.style.left = `${Math.max(8, Math.min(value.hasAttribute("data-env-color") ? rect.right - menu.offsetWidth : rect.left, innerWidth - menu.offsetWidth - 8))}px`
      menu.style.top = `${rect.bottom}px`
      menu.style.maxHeight = `calc(var(--demo-line) * 10 + 2px)`
    })
    sync()
  })

  const runner = demo.querySelector<HTMLElement>('[data-app-surface="runner"]')!
  const requests = [...runner.querySelectorAll<HTMLButtonElement>("[data-runner-request]")]
  const selected = new Set(requests.map((request) => request.dataset.runnerRequest!))
  const run = runner.querySelector<HTMLButtonElement>("[data-runner-run]")!
  const delay = runner.querySelector<HTMLInputElement>("[data-runner-delay]")!
  const data = runner.querySelector<HTMLInputElement>("[data-runner-data]")!
  const error = runner.querySelector<HTMLElement>("[data-runner-error]")!
  const tabs = [...runner.querySelectorAll<HTMLButtonElement>("[data-runner-tab]")]
  const results = runner.querySelector<HTMLElement>("[data-runner-results]")!
  let timer: ReturnType<typeof setTimeout> | undefined
  let running = false
  const showTab = (tab: HTMLButtonElement) => {
    tabs.forEach((item) => {
      const active = item === tab
      item.setAttribute("aria-selected", String(active))
      item.tabIndex = active ? 0 : -1
      runner.querySelector<HTMLElement>(`#${item.getAttribute("aria-controls")}`)!.hidden = !active
    })
  }
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => { pause(); showTab(tab) })
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return
      event.preventDefault()
      const visible = tabs.filter((tab) => !tab.hidden)
      const index = visible.indexOf(tab)
      const next = event.key === "Home" ? 0 : event.key === "End" ? visible.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + visible.length) % visible.length
      visible[next]!.click()
      visible[next]!.focus()
    })
  })
  const matchesTags = (request: HTMLButtonElement) => {
    const tags = request.dataset.tags!.split(" ")
    const filters = (type: string) => [...runner.querySelectorAll<HTMLElement>(`[data-runner-filter="${type}"][aria-pressed="true"]`)].map((button) => button.dataset.tag!)
    return filters("include").every((tag) => tags.includes(tag)) && !filters("exclude").some((tag) => tags.includes(tag))
  }
  const updateRunner = () => {
    const matches = requests.filter((request) => selected.has(request.dataset.runnerRequest!) && matchesTags(request))
    for (const request of requests) {
      const included = matches.includes(request)
      request.setAttribute("aria-pressed", String(included))
      request.querySelector("[data-runner-check]")!.textContent = included ? "[x]" : "[ ]"
      request.disabled = running || !matchesTags(request)
    }
    runner.querySelectorAll<HTMLButtonElement>("[data-runner-folder]").forEach((folder) => {
      const rows = requests.filter((request) => request.dataset.folder === folder.dataset.runnerFolder)
      const count = rows.filter((request) => matches.includes(request)).length
      folder.setAttribute("aria-pressed", count === rows.length ? "true" : count ? "mixed" : "false")
      folder.querySelector("[data-runner-check]")!.textContent = count === rows.length ? "[x]" : count ? "[-]" : "[ ]"
      folder.disabled = running
    })
    runner.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLButtonElement>(".runner-options-scroll input, .runner-options-scroll select, .runner-options-scroll button").forEach((control) => { control.disabled = running })
    const valid = delay.value.trim() !== "" && Number.isInteger(Number(delay.value)) && Number(delay.value) >= 0 && Number(delay.value) <= 1000
    error.hidden = valid
    error.textContent = valid ? "" : "Enter a delay from 0 to 1000ms for this sample."
    run.disabled = running || matches.length === 0 || !valid
    runner.querySelector<HTMLElement>("[data-runner-iterations]")!.hidden = !data.value
    if (!running) run.querySelector("span")!.textContent = `Run ${matches.length * (data.value ? 2 : 1)} request${matches.length * (data.value ? 2 : 1) === 1 ? "" : "s"}`
    return matches
  }
  const tagOverlay = runner.querySelector<HTMLElement>("[data-runner-tag-overlay]")!
  demo.querySelector(".terminal")!.append(tagOverlay)
  const tagInput = tagOverlay.querySelector<HTMLInputElement>("[data-runner-tag-value]")!
  const tagError = tagOverlay.querySelector<HTMLElement>("[data-runner-tag-error]")!
  const suggestions = tagOverlay.querySelector<HTMLElement>("[data-runner-tag-suggestions]")!
  let tagFilter = "include"
  let tagTrigger: HTMLButtonElement | undefined
  const closeTagEditor = () => {
    tagOverlay.hidden = true
    runner.inert = false
    tagTrigger?.focus()
  }
  const saveTag = () => {
    const tag = tagInput.value
    if (!tag || tag !== tag.trim()) { tagError.hidden = false; return }
    let chip = [...runner.querySelectorAll<HTMLButtonElement>("[data-runner-filter]")].find((button) => button.dataset.runnerFilter === tagFilter && button.dataset.tag === tag)
    if (!chip) {
      chip = document.createElement("button")
      chip.type = "button"
      chip.className = "tag-filter-choice"
      chip.dataset.runnerFilter = tagFilter
      chip.dataset.tag = tag
      chip.setAttribute("aria-pressed", "false")
      chip.setAttribute("aria-label", `Remove ${tagFilter} tag ${tag}`)
      chip.textContent = `#${tag}`
      tagTrigger!.before(chip)
    }
    if (chip.getAttribute("aria-pressed") !== "true") chip.click()
    closeTagEditor()
  }
  runner.querySelectorAll<HTMLButtonElement>("[data-runner-add-filter]").forEach((button) => button.addEventListener("click", () => {
    pause()
    tagFilter = button.dataset.runnerAddFilter!
    tagTrigger = button
    tagInput.value = ""
    tagError.hidden = suggestions.hidden = true
    tagOverlay.querySelector("[data-runner-tag-title]")!.textContent = tagFilter === "include" ? "Include Tag" : "Exclude Tag"
    tagOverlay.hidden = false
    runner.inert = true
    tagInput.focus()
  }))
  tagInput.addEventListener("input", () => {
    tagError.hidden = true
    const options = [...suggestions.querySelectorAll<HTMLButtonElement>("[data-runner-tag-suggestion]")]
    options.forEach((option) => { option.hidden = !option.dataset.runnerTagSuggestion!.includes(tagInput.value.toLowerCase()) })
    suggestions.hidden = !tagInput.value || !options.some((option) => !option.hidden)
  })
  suggestions.querySelectorAll<HTMLButtonElement>("[data-runner-tag-suggestion]").forEach((option) => option.addEventListener("click", () => {
    tagInput.value = option.dataset.runnerTagSuggestion!
    suggestions.hidden = true
    tagInput.focus()
  }))
  tagOverlay.querySelector("[data-runner-tag-save]")!.addEventListener("click", saveTag)
  tagOverlay.querySelectorAll("[data-runner-tag-close]").forEach((button) => button.addEventListener("click", closeTagEditor))
  tagOverlay.addEventListener("keydown", (event) => {
    if (!event.ctrlKey && !event.metaKey && !event.altKey && event.key === "Enter") {
      event.preventDefault()
      event.stopPropagation()
      saveTag()
    } else if (event.key === "ArrowDown" && event.target === tagInput) {
      event.preventDefault()
      suggestions.querySelector<HTMLButtonElement>("button:not([hidden])")?.focus()
    }
  })
  tagOverlay.addEventListener("click", (event) => { if (event.target === tagOverlay) closeTagEditor() })
  runner.querySelector<HTMLButtonElement>("[data-runner-fail-fast]")!.addEventListener("click", (event) => {
    pause()
    const button = event.currentTarget as HTMLButtonElement
    const checked = button.getAttribute("aria-pressed") !== "true"
    button.setAttribute("aria-pressed", String(checked))
    button.textContent = checked ? "[x]" : "[ ]"
  })
  requests.forEach((request) => request.addEventListener("click", () => {
    pause()
    const id = request.dataset.runnerRequest!
    if (selected.has(id)) selected.delete(id)
    else selected.add(id)
    updateRunner()
  }))
  runner.querySelectorAll<HTMLButtonElement>("[data-runner-folder]").forEach((folder) => folder.addEventListener("click", () => {
    pause()
    const rows = requests.filter((request) => request.dataset.folder === folder.dataset.runnerFolder && matchesTags(request))
    const all = rows.every((request) => selected.has(request.dataset.runnerRequest!))
    rows.forEach((request) => all ? selected.delete(request.dataset.runnerRequest!) : selected.add(request.dataset.runnerRequest!))
    updateRunner()
  }))
  runner.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-runner-filter]")
    if (!button || button.disabled) return
    pause()
    button.setAttribute("aria-pressed", String(button.getAttribute("aria-pressed") !== "true"))
    button.hidden = button.getAttribute("aria-pressed") !== "true"
    updateRunner()
  })
  runner.querySelectorAll("input, select").forEach((input) => input.addEventListener("input", () => { pause(); updateRunner() }))
  const stopRun = (cancelled = false) => {
    if (running && cancelled) runner.querySelector<HTMLElement>("[data-runner-summary]")!.textContent = `Cancelled · ${results.children.length} sample results`
    clearTimeout(timer)
    timer = undefined
    running = false
    runner.removeAttribute("aria-busy")
    updateRunner()
  }
  run.addEventListener("click", () => {
    pause()
    const matches = updateRunner()
    const queue = data.value ? [...matches, ...matches] : matches
    if (run.disabled) return
    results.replaceChildren()
    running = true
    runner.setAttribute("aria-busy", "true")
    tabs[1]!.hidden = false
    showTab(tabs[1]!)
    updateRunner()
    const summary = runner.querySelector<HTMLElement>("[data-runner-summary]")!
    let index = 0
    const completeNext = () => {
      const request = queue[index]!
      const row = document.createElement("details")
      row.className = "runner-result"
      row.name = "demo-runner-result"
      const heading = document.createElement("summary")
      const label = document.createElement("span")
      label.textContent = `PASS  ${request.dataset.method} ${request.dataset.name}`
      const timing = document.createElement("span")
      timing.textContent = `${request.dataset.duration}ms`
      heading.append(label, timing)
      const detail = document.createElement("pre")
      detail.textContent = `${request.dataset.status} · ${runner.querySelector<HTMLSelectElement>("[data-runner-env]")!.value}${data.value ? ` · Iteration ${Math.floor(index / matches.length) + 1}` : ""}\n${request.dataset.response}`
      row.append(heading, detail)
      results.append(row)
      index++
      summary.textContent = `${index}/${queue.length} passed · sample run`
      if (index === queue.length) {
        stopRun()
        announce(`${queue.length} sample requests passed.`)
      } else scheduleNext()
    }
    const scheduleNext = () => {
      run.querySelector("span")!.textContent = `Running ${index + 1}/${queue.length}`
      summary.textContent = `Running ${index + 1}/${queue.length} · sample run`
      timer = setTimeout(completeNext, 180 + Number(delay.value))
    }
    scheduleNext()
  })
  updateRunner()
  surfaces.forEach((surface) => {
    surface.querySelectorAll<HTMLButtonElement>("[data-app-close]").forEach((button) => button.addEventListener("click", () => navigate("close")))
    surface.addEventListener("click", (event) => {
      pause()
      if (event.target === surface && surface.classList.contains("picker-backdrop")) navigate("close")
    })
  })
  return {
    activate: (id?: string) => {
      if (!tagOverlay.hidden) closeTagEditor()
      stopRun(true)
      remaskSecrets()
      applyTheme()
      surfaces.forEach((surface) => {
        surface.querySelectorAll<HTMLElement>("[popover]").forEach((menu) => { if (menu.matches(":popover-open")) menu.hidePopover() })
        surface.hidden = surface.dataset.appSurface !== id
        if (!surface.hidden) surface.dispatchEvent(new Event("demo:activate"))
      })
      return surfaces.find((surface) => surface.dataset.appSurface === id)
    },
  }
}
