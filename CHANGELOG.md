# Change Log

## 2.4.7

*2021-09-01*

- Add ability to parse escaped period in variable declaration (#162)
- Replace Travis CI with GitHub workflows

## 2.4.6

*2021-06-26*

- Improve CSS parser performance (#160)

## 2.4.5

*2021-04-29*

- Fix ES6 syntax in ES5 distributable files (#158)

## 2.4.4

*2021-04-26*

- Add CSSOM limitation notes and related links to docs
- Fix rare exception when converting node lists to arrays (#153)
- Fix empty `<link>` stylesheet triggering `onError()` (#155)

## 2.4.3

*2021-01-30*

- Fix subsequent calls with disabled `<link>` nodes
- Fix handling of user-disabled `<link>` and `<style>` nodes

## 2.4.2

*2020-11-21*

- Fix error when attempting to disable an undefined `node.sheet` (#144)
- Fix detection of SVG `<style>` nodes (#146)

## 2.4.1

*2020-11-05*

- Fix `forEach` error in legacy browsers

## 2.4.0

*2020-11-03*

- Add `watch` detection of `<style>` text content changes (#135)
- Fix `watch` detection of `<link>` attribute changes (#138)
- Fix skip behavior of `<link>` elements with `disabled` attribute

## 2.3.2

*2020-06-21*

- Fix `options.updateURLs` behavior so relative `url()` paths in `<style>`
  elements are not updated (#129)
- Add interface export for options typings (#126)

## 2.3.1

*2020-05-07*

- Fix `disabled` state check on injected `<link>` nodes

## 2.3.0

*2020-04-27*

- Add `options.onFinally` callback (#113)
- Add disabling of CSS source nodes after ponyfill-generated CSS has been
  appended to the DOM. This change prevents duplicate CSS rules which improves
  style recalculation times in the browser. (#120)

## 2.2.1

*2020-02-19*

- Fix parsing of `@page` margin box type rules (#97)
- Fix unintended parsing of custom property values from `:host` and `:root`
  with attribute, descendant, pseudo, sibling, etc. selectors (#112)

## 2.2.0

*2020-02-17*

- Add support for HTML `<base>` tag via updated `get-css-data` dependency

## 2.1.4

*2020-02-17*

- Fix "Expected Token" bug in legacy browsers due to babel config error (#111)

## 2.1.3

*2020-02-15*

- Fix `options.variables` persistence (#99)

## 2.1.2

*2019-09-04*

- Fix bug that allowed a `:root`-level custom property value to override
  `:host`-level value with the same name

## 2.1.1

*2019-08-16*

- Update README.md

## 2.1.0

*2019-08-16*

- Add `sideEffects:false` to `package.json` to allow bundler tree-shaking
- Add support for parsing `:host` custom property declarations
- Add support for parsing comma-separated `:root` and `:host` selectors
- Fix `:root` and `:host` selector tests (no classes, IDs, psuedo, etc.)
- Fix parsing of `@media` rules without query
- Fix `options.silent` description

## 2.0.2

*2019-04-24*

- Fix TypeScript support

## 2.0.1

*2019-04-22*

- Update homepage URL in package.json

## 2.0.0

*2019-04-22*

**Breaking Changes**

- Add support for incremental updates. This change significantly increases
  performance on subsequent ponyfill calls by applying transformed CSS to the
  DOM using multiple `<style>` elements instead of a single element as was done
  in 1.x.
- Rename `options.onlyVars` to `options.preserveStatic`
- Rename `options.preserve` to `options.preserveVars`
- Change `options.onComplete` behavior so that the second argument returns an
  `array` of `<style>` elements appended to the DOM during each ponyfill call.
  Previously, this argument returned a single element reference because the
  ponyfill used only a single `<style>` element.
- Remove `options.fixNestedCalc`. Nested `calc()` statements are modified for
  compatibility with legacy browsers as they were previously when this option
  was set to `true` (default). Only the option to disable this functionality has
  been removed.
- Remove `dist` directory from repo

**Other Changes**

- Fix bug that allowed :root-level custom property declarations in comments
  and media queries be processed when initially called with `options.shadowDOM`
  set to true

## 1.17.2

*2019-03-08*

- Fix error in legacy browsers caused by improper `performance.now()` check
- Fix TypeScript definitions by adding `benchmark` to `options.onComplete`

## 1.17.1

*2019-03-01*

- Add `data-cssvars` attribute to processed `<link>` and `<style>` elements
- Change ponyfill `<style>` injection logic so that the element is always
  available in the correct DOM position (even when `updateDOM` is `false`) and
  a reference is always returned with the `options.onComplete` callback.
- Fix detection of unchanged source CSS and ponyfill options

## 1.17.0

*2019-02-26*

- Add optimization that prevents reprocessing data when input is unchanged
  from previous ponyfill call
- Add console `info` message when input is unchanged from previous ponyfill
  call
- Add `benchmark` argument to `options.onComplete` callback which provides
  the execution time of a ponyfill call in milliseconds
- Add `cssVars():` prefix to all console messages
- Change `options.watch` debounce timer from `1` to `100` milliseconds
- Fix `options.watch` MutationObserver performance issue that resulted in
  unnecessary processing when a large number of DOM mutations occur
- Fix `options.watch` performance issue that resulted in unnecessary
  consecutive ponyfill calls (initial call + first mutation)

## 1.16.4

*2019-01-30*

- Fix IE9 CORS check by updating `get-css-data` dependency

## 1.16.3

*2019-01-25*

- Update method of merging default and user options from deep to shallow merge
  to better accommodate SSR / virtual DOM environments
- Fix parsing of variable functions that contain spaces, tabs, and new lines

## 1.16.2

*2018-12-23*

- Update preferred CDN link to jsdelivr

## 1.16.1

*2018-12-17*

- Fix removal of unrecognized at-rule when `options.onlyVars` is `true`

## 1.16.0

*2018-12-14*

- Add `types` property to package.json
- Update `options.onlyVars` implementation resulting in a significant
  performance increase
- Fix build status badge (now reflects only master branch status)

## 1.15.3

*2018-11-28*

- Fix bug that incorrectly transformed variable functions that resolve to
  values containing parenthesis with fallback values that also contain
  parenthesis (#42)

## 1.15.2

*2018-11-24*

- Update README with `options.onlyLegacy` examples

## 1.15.1

*2018-11-14*

- Fix bug that prevented IE10 from fetching `<link>` CSS data from external
  domains

## 1.15.0

*2018-11-12*

- Change `options.onSuccess` callback to better handle falsey return values
  (e.g. `false`, `null`, `0`, `""`)

## 1.14.0

*2018-11-11*

- Update `get-css-data` dependency and added test for invalid `<link>` CSS text
  (test for HTML returned from stylesheet 404 redirect)

## 1.13.0

*2018-11-09*

- Add ability to change the ponyfill settings used by the `options.watch`
  MutationObserver by setting `options.watch` set to `true`
- Add ability to disconnect the ponyfill MutationObserver by setting
  `options.watch` to `false`

## 1.12.2

*2018-11-06*

- Change `options.onComplete` callback to return a clone instead of a reference
  to the internal variable storage object as the `cssVariables` argument
- Fix bug that prevented `options.variables` values from persisting properly
  (regression introduced in 1.11.0)

## 1.12.1

*2018-11-04*

- Fix bug that caused the `options.onComplete` callback's `cssVariables`
  argument to be returned as an empty object when `options.updateDOM` is set to
  `false`.

## 1.12.0

*2018-10-25*

- Add TypeScript definitions

## 1.11.3

*2018-10-24*

- Fix bug in modern browsers that caused `options.variables` values to be
  applied to the `document` instead of the `options.rootElement`, resulting
  in custom properties being applied to all elements instead of scoped to the
  specified root element

## 1.11.0

*2018-10-03*

- Add logic to automatically get document-level CSS custom property values
  when `options.rootElement` has been set to a shadow host or root. These values
  are required by the polyfill to transform shadow `<link>` and `<style>`
  elements. This new behavior makes it possible to target a shadow host or root
  element without manually getting the document-level custom property values
  first.
- Fix custom property values not persisting when CSS being processed contains
  only custom properties
- Fix ‘document is not defined’ error in SSR environment introduced in 1.10.0

## 1.10.0

*2018-09-28*

- Add `options.rootElement` for specifying the root element to traverse for
  `<link>` and `<style>` elements
- Add `options.shadowDOM` to determine if shadow DOM `<link>` and `<style>`
  elements should be processed
- Add `cssVariables` argument to `options.onComplete` callback

## 1.9.0

*2018-08-07*

- Add check for non-browser environments to support Node+SSR (#16)
- Fix keyframe animation fix by adding vendor prefixes for `animation-name`
  and `@keyframes`
- Fix internal placeholder comments appearing in CSS output instead of
  stylesheet content (#15)
- Fix multiple `var()` functions resolving to `undefined` when they do not
  resolve to a custom property or fallback value (#18)

## 1.8.0

*2018-07-12*

- Add `options.watch` feature which creates a MutationObserver that will execute
  the ponyfill when a `<link>` or `<style>` DOM mutation is observed (#8)
- Add fix for browser-related bugs that prevent keyframe animations from being
  applied when values are initially set using custom properties or updated using
  the `variables` ponyfill options (#13)
- Fix inaccurate “variable is undefined” console warning when a custom
  property value is `0` or `false`

## 1.7.2

*2018-05-20*

- Change `options.onError` callback `url` argument so that it always returns an
  absolute URL
- Update README with `options.onError` fixes and a few other minor tweaks

## 1.7.1

*2018-05-19*

- Fix `options.onError` message sent to console so that a URL is included when
  the status code is `0`. Also added a hint that these errors are possibly
  related to CORS restrictions to assist debugging efforts.
- Update README with performance tips and better examples for `options.include`
  and `options.exclude`

## 1.7.0

*2018-05-18*

- Add optimization that allows the ponyfill to skip processing of `<link>` and
  `<style>` data that does not contain a CSS custom property declaration or
  function (#9)

## 1.6.0

*2018-05-17*

- Add `options.updateURLs` for converting relative `url()` paths to absolute
  urls (#8)

## 1.5.0

*2018-05-16*

- Add `options.onBeforeSend` callback (#7)
- Change `options.onSuccess` callback so that it is called after CSS data has
  been collected from each element before CSS custom properties have been
  transformed

## 1.4.0

*2018-04-23*

- Update `get-css-data` dependency to 1.2.0 to resolve a callback related bug
- Change logic for inserting generated `<style>` element. Element is now
  inserted after the last `<style>` or `<link>` element processed. This
  change, combined with the proceeding change, ensures that the original cascade
  order is maintained after the transformed styles are appended to the DOM.
- Change `options.onlyVars` default value from `true` to `false`. This
  change, combined with the preceding change, ensures that the original cascade
  order is maintained after the transformed styles are appended to the DOM.

## 1.3.0

*2018-04-17*

- Add `fixNestedCalc` option to remove nested `calc` keywords for legacy
  browser compatibility

## 1.2.2

*2018-03-24*

- Update README Examples section

## 1.2.1

*2018-03-20*

- Update README Examples section

## 1.2.0

*2018-03-20*

- Fix "Cannot read property 'length' of undefined" bug triggered while
  filtering comments that are a direct descendant of an at-rule (#1)

## 1.1.2

*2018-03-12*

- Update README browser support table

## 1.1.1

*2018-03-12*

- Update README: Added TOC, added demo link, added browser support table,
  updated examples

## 1.1.0

*2018-02-08*

- Fix bug that prevented `options.onlyVars` from properly filtering
  declarations that do not contain a custom property value or function
- Change `options.preserve` default value from `true` to `false`. This aligns
  with other default values which assume a "legacy-only" configuration.
- Change logic for inserting generated `<style>` element. Element is now
  inserted as first CSS source element rather than the last. This allows the
  cascade order to be maintained when `options.onlyVars` is `true`.

## 1.0.0

*2018-01-31*

- Initial release
