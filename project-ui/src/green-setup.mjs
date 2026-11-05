/**
 * BTR — SEB Green Design System setup.
 *
 * Imports and registers Green Core web components + transitional styles.
 * This file is bundled by esbuild into public/js/green.bundle.js (IIFE).
 * It must load BEFORE app scripts so custom elements are defined when
 * innerHTML-based rendering creates them.
 */

// ── Theme (provides design tokens as CSS custom properties) ──
import '@sebgroup/green-core/components/theme/index.js'
import { register as registerThemeStyles } from '@sebgroup/green-core/components/theme/theme.trans.styles.js'

// ── Button ──
import '@sebgroup/green-core/components/button/index.js'
import { register as registerButtonStyles } from '@sebgroup/green-core/components/button/button.trans.styles.js'

// ── Badge ──
import '@sebgroup/green-core/components/badge/index.js'

// ── Card ──
import '@sebgroup/green-core/components/card/index.js'

// ── Input ──
import '@sebgroup/green-core/components/input/index.js'
import { register as registerInputStyles } from '@sebgroup/green-core/components/input/input.trans.styles.js'

// ── Textarea ──
import '@sebgroup/green-core/components/textarea/index.js'

// ── Select / Dropdown ──
import '@sebgroup/green-core/components/select/index.js'
import { register as registerSelectStyles } from '@sebgroup/green-core/components/select/select.trans.styles.js'

// ── Dialog ──
import '@sebgroup/green-core/components/dialog/index.js'

// ── Spinner ──
import '@sebgroup/green-core/components/spinner/index.js'

// ── Layout primitives ──
import '@sebgroup/green-core/components/flex/index.js'
import '@sebgroup/green-core/components/grid/index.js'
import '@sebgroup/green-core/components/div/index.js'
import '@sebgroup/green-core/components/divider/index.js'

// ── Text ──
import '@sebgroup/green-core/components/text/index.js'

// ── Signal ──
import '@sebgroup/green-core/components/signal/index.js'

// ── Icon ──
import '@sebgroup/green-core/components/icon/index.js'

// ── Breadcrumbs ──
import '@sebgroup/green-core/components/breadcrumbs/index.js'

// ── Segmented Control (tabs) ──
import '@sebgroup/green-core/components/segmented-control/index.js'
import { register as registerSegStyles } from '@sebgroup/green-core/components/segmented-control/segmented-control.trans.styles.js'
import { register as registerSegmentStyles } from '@sebgroup/green-core/components/segmented-control/segment/segment.trans.styles.js'

// ── Register transitional styles (SEB 2016 visual design language) ──
registerThemeStyles()
registerButtonStyles()
registerInputStyles()
registerSelectStyles()
registerSegStyles()
registerSegmentStyles()

console.log('[BTR] SEB Green Design System initialised')
