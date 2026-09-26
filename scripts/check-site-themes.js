// Paste into any site page's browser console, then run: await checkSiteThemes()
async function checkSiteThemes(doc = document) {
  const view = doc.defaultView
  const root = doc.documentElement
  const pickers = [...doc.querySelectorAll('[data-theme-picker]')]
  const menu = (picker) => doc.getElementById(picker.getAttribute('aria-controls'))
  const options = [...menu(pickers[0]).querySelectorAll('[data-theme-option]')]
  const settle = () => new Promise((resolve) => view.setTimeout(resolve, 0))
  let passed = 0
  const assert = (condition, message) => { if (!condition) throw new Error(message); passed++ }
  const original = root.dataset.siteTheme
  const saved = view.localStorage.getItem('noodle-site-theme')
  const requests = () => view.performance.getEntriesByType('resource').filter((entry) => ['fetch', 'xmlhttprequest'].includes(entry.initiatorType)).length
  const before = requests()
  const codeColors = new Set()
  assert(pickers.length > 0 && pickers.every((picker) => !picker.disabled), 'Theme controls initialized')
  const synchronized = (theme) => pickers.every((picker) => menu(picker).querySelector('[aria-checked="true"]')?.dataset.themeOption === theme)
  assert(synchronized(original), 'Every picker reflects the restored preference')
  assert(options.length === 8, 'Exactly eight palettes')
  const rgb = (hex) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ')})`
  try {
    for (const option of options) {
      pickers[0].click()
      await settle()
      assert(menu(pickers[0]).matches(':popover-open') && pickers[0].getAttribute('aria-expanded') === 'true', 'Menu opens')
      assert(doc.activeElement?.getAttribute('aria-checked') === 'true', 'Opening focuses the current theme')
      option.click()
      await settle()
      const theme = option.dataset.themeOption
      assert(!menu(pickers[0]).matches(':popover-open') && doc.activeElement === pickers[0], 'Selection closes the menu and restores focus')
      const style = view.getComputedStyle(root)
      const color = (name) => rgb(style.getPropertyValue(name).trim())
      assert(root.dataset.siteTheme === theme && root.dataset.theme === 'dark', `${theme}: root state`)
      assert(synchronized(theme), `${theme}: synchronized controls`)
      assert(pickers.every((picker) => picker.textContent.trim() === option.textContent.trim()), `${theme}: trigger label`)
      assert(view.localStorage.getItem('noodle-site-theme') === theme, `${theme}: preference saved`)
      assert(view.getComputedStyle(doc.body).backgroundColor === color('--bg'), `${theme}: page background`)
      assert(view.getComputedStyle(doc.body).color === color('--fg'), `${theme}: page text`)
      const pre = doc.querySelector('.expressive-code pre')
      if (pre) {
        assert(view.getComputedStyle(pre).backgroundColor === color('--bg-elevated'), `${theme}: code background`)
        codeColors.add(view.getComputedStyle(pre.querySelector('span[style]')).color)
      }
    }
    pickers[0].click()
    await settle()
    const key = (key) => doc.activeElement.dispatchEvent(new view.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
    key('Home')
    assert(doc.activeElement === options[0], 'Home focuses the first theme')
    key('ArrowUp')
    assert(doc.activeElement === options.at(-1), 'Arrow navigation wraps')
    key('ArrowDown')
    assert(doc.activeElement === options[0], 'Arrow navigation wraps forward')
    key('End')
    assert(doc.activeElement === options.at(-1), 'End focuses the last theme')
    key('c')
    assert(doc.activeElement.dataset.themeOption === 'carbonfox', 'Typing a letter finds a theme')
    assert(root.dataset.siteTheme === 'synthwave84', 'Keyboard browsing does not change the selected theme')
    key('Tab')
    assert(!menu(pickers[0]).matches(':popover-open'), 'Tab dismisses the menu')
    if (doc.querySelector('.expressive-code')) assert(codeColors.size >= 3, 'Syntax colors change with the palette')
    assert(requests() === before, 'Theme switching makes no fetch/XHR requests')
  } finally {
    options.find((option) => option.dataset.themeOption === original).click()
    if (saved === null) view.localStorage.removeItem('noodle-site-theme')
    else view.localStorage.setItem('noodle-site-theme', saved)
  }
  return { passed }
}
