// Paste into the landing page console and run checkTourSelector() after selecting or playing a chapter.
// Also run with the menu open after keyboard navigation, and at tablet widths.
function checkTourSelector(doc = document) {
  const view = doc.defaultView
  const demo = doc.querySelector('[data-noodle-demo]')
  const trigger = demo.querySelector('[data-tour-select]')
  const title = trigger.getAttribute('aria-label')
  const options = [...demo.querySelectorAll('[data-tour-option]')]
  const selected = options.filter((option) => option.getAttribute('aria-checked') === 'true')
  const chapter = selected[0]
  const active = demo.querySelector('[data-example]:not([hidden])')
  let passed = 0
  const assert = (condition, message) => { if (!condition) throw new Error(message); passed++ }
  assert(trigger.tagName === 'BUTTON' && !trigger.disabled && trigger.closest('.terminal-title'), 'Chapter selector is enabled in the terminal title bar')
  assert(!demo.querySelector('.demo-tour, .tour-copy, .tour-descriptions'), 'Separate tour heading and descriptions are removed')
  assert(options.length === 22, 'Every chapter is selectable')
  assert(demo.querySelector('.terminal-title .tour-controls'), 'Playback controls share the terminal title bar')
  if (chapter) {
    assert(selected.length === 1, 'Exactly one chapter is selected')
    assert(active.dataset.example === chapter.dataset.tourOption, 'Selected chapter matches the terminal request')
    assert(title === `Tour chapter, ${options.indexOf(chapter) + 1} / ${options.length} · ${chapter.dataset.title} selected`, 'Accessible selector label identifies the current chapter')
  } else {
    assert(title === `Tour chapter, ${active.dataset.name} selected`, 'Exploration identifies the request without a false chapter selection')
  }
  assert(demo.querySelector('[data-tour-title]').textContent === (chapter ? chapter.dataset.title : active.dataset.name), 'Visible title follows the selected chapter or request')
  const fontSize = Number.parseFloat(view.getComputedStyle(trigger).fontSize)
  assert(fontSize === Number.parseFloat(view.getComputedStyle(demo).fontSize), 'Selector uses the compact terminal typography')
  const bar = demo.querySelector('.terminal-title').getBoundingClientRect()
  for (const button of demo.querySelectorAll('.terminal-title button:not([role="menuitemradio"])')) {
    const rect = button.getBoundingClientRect()
    const minimum = view.matchMedia('(min-width: 680px) and (pointer: fine)').matches ? 28 : 44
    assert(rect.height >= minimum && rect.left >= bar.left && rect.right <= bar.right, 'Title bar controls keep their pointer or touch size and stay inside the terminal')
  }
  for (const picker of doc.querySelectorAll('[data-select-menu]')) {
    const button = picker.querySelector('[data-select-trigger]')
    const menu = picker.querySelector('[popover]')
    assert(button.getAttribute('popovertarget') === menu.id && button.getAttribute('aria-controls') === menu.id, 'Shared selector has a native popover target')
    const open = menu.matches(':popover-open')
    assert(button.getAttribute('aria-expanded') === String(open), 'Expanded state matches visibility')
    if (open) {
      const rect = menu.getBoundingClientRect()
      const anchor = button.getBoundingClientRect()
      assert(rect.left >= 0 && rect.right <= view.innerWidth && rect.top >= 0 && rect.bottom <= view.innerHeight, 'Menu stays inside the viewport')
      assert(rect.bottom <= anchor.top || rect.top >= anchor.bottom, 'Menu does not cover its title')
      assert(menu.contains(doc.activeElement), 'Open menu holds keyboard focus')
      if (picker.classList.contains('tour-picker')) assert(demo.querySelector('[data-tour-progress]').getAnimations().every((animation) => animation.playState === 'paused'), 'Opening the chapter menu holds the timer')
    }
  }
  return { passed, title, fontSize }
}

// While playing, open the menu and capture const held = checkTourPlayback(true).
// Dismiss without selecting, then immediately run checkTourPlayback(true, held.elapsed, held.elapsed + 2000).
// Select a new chapter and immediately run checkTourPlayback(true, 0, 2000).
// Pause manually, open/dismiss or select a chapter, then run checkTourPlayback(false).
function checkTourPlayback(playing, minTime = 0, maxTime = Infinity) {
  const demo = document.querySelector('[data-noodle-demo]')
  const open = demo.querySelector('.tour-picker [popover]').matches(':popover-open')
  const animation = demo.querySelector('[data-tour-progress]').getAnimations()[0]
  const elapsed = Number(animation?.currentTime ?? 0)
  if ((demo.querySelector('[data-tour-play]').getAttribute('aria-label') === 'Pause tour') !== playing) throw new Error('Playback intent changed')
  const tree = demo.querySelector('.request-tree')
  const openFolders = tree.querySelectorAll('.request-folder[open]').length
  if (playing && (openFolders < 3 || openFolders > 4)) throw new Error('Playback should show three or four folders')
  if (playing && tree.scrollHeight > tree.clientHeight) throw new Error('Playing folders must fit without a scrollbar')
  if (playing && !demo.querySelector('[data-request][aria-pressed="true"]').closest('.request-folder').open) throw new Error('The active request folder must stay open')
  if (playing && !open && animation?.playState !== 'running') throw new Error('Tour did not resume')
  if ((!playing || open) && animation && animation.playState !== 'paused') throw new Error('Timer did not pause')
  if (elapsed < minTime || elapsed > maxTime) throw new Error(`Unexpected timer position: ${elapsed}`)
  return { playing, open, elapsed }
}
