# Change Log

## 1.17.2

*2019-03-08*

- Fixed error in legacy browsers caused by improper `performance.now()` check
- Fixed TypeScript definitions by adding `benchmark` to `options.onComplete`

## 1.17.1

*2019-03-01*

- Added `data-cssvars` attribute to processed `<link>` and `<style>` nodes

- Changed ponyfill `<style>` injection logic so that the element is always
  available in the correct DOM postiion (even when `updateDOM` is `false`) and
  a reference is always returned with the `options.onComplete` callback.

- Fixed detection of unchanged source CSS and ponyfill options

## 1.17.0

*2019-02-26*

- Added optimization that prevents reprocessing data when input is unchanged
  from previous ponyfill call.

- Added console `info` message when input is unchanged from previous ponyfill
  call.

- Added `benchmark` argument to `options.onComplete` callback which provides
  the execution time of a ponyfill call in milliseconds.

- Added `cssVars():` prefix to all console messages.

- Changed `options.watch` debounce timer from `1` to `100` milliseconds.

- Fixed `options.watch` MutationObserver performance issue that resulted in
  unnecessary processing when a large number of DOM mutations occur.

- Fixed `options.watch` performance issue that resulted in unnecessary
  consecutive ponyfill calls (initial call + first mutation).

## 1.16.4

*2019-01-30*

- Fixed IE9 CORS check by updating `get-css-data` dependency

## 1.16.3

*2019-01-25*

- Updated method of merging defanult and user options from deep to shallow merge
  to better accommodate SSR / virtual DOM environments.

- Fixed parsing of variable functions that contain spaces, tabs, and new lines.

## 1.16.2

*2018-12-23*

- Updated preferred CDN link to jsdelivr.

## 1.16.1

*2018-12-17*

- Fixed removal of unrecognized at-rule when `options.onlyVars` is `true`.

## 1.16.0

*2018-12-14*

- Added `types` property to package.json.

- Updated `options.onlyVars` implementation resulting in a significant
  performance increase.

- Fixed build status badge (now reflects only master branch status).

## 1.15.3

*2018-11-28*

- Fixed bug that incorrectly transformed variable functions that resolve to
  values containing parenthesis with fallback values that also contain
  parenthesis (#42).

## 1.15.2

*2018-11-24*

- Updated README with `options.onlyLegacy` examples.

## 1.15.1

*2018-11-14*

- Fixed bug that prevented IE10 from fetching `<link>` CSS data from external
  domains.

## 1.15.0

*2018-11-12*

- Changed `options.onSuccess` callback to better handle falsey return values
  (e.g. `false`, `null`, `0`, `""`).

## 1.14.0

*2018-11-11*

- Updated `get-css-data` dependency and added test for invalid `<link>` CSS text
  (test for HTML returned from stylesheet 404 redirect).

## 1.13.0

*2018-11-09*

- Added ability to change the ponyfill settings used by the `options.watch`
  MutationObserver by setting `options.watch` set to `true`.

- Added ability to disconnect the ponyfill MutationObserver by setting
  `options.watch` to `false`.

## 1.12.2

*2018-11-06*

- Changed `options.onComplete` callback to return a clone instead of a reference
  to the internal variable storage object as the `cssVariables` argument.

- Fixed bug that prevented `options.variables` values from persisting properly
  (regression introduced in 1.11.0).

## 1.12.1

*2018-11-04*

- Fixed bug that caused the `options.onComplete` callback's `cssVariables`
  argument to be returned as an empty object when `options.updateDOM` is set to
  `false`.

## 1.12.0

*2018-10-25*

- Added TypeScript definitions.

## 1.11.1-3

*2018-10-24*

- Fixed bug in modern browsers that caused `options.variables` values to be
  applied to the `document` instead of the `options.rootElement`, resulting
  in custom properties being applied to all elements instead of scoped to the
  specified root element.

## 1.11.0

*2018-10-03*

- Added logic to automatically get document-level CSS custom property values
  when `options.rootElement` has been set to a shadow host or root. These values
  are required by the polyfill to transform shadow `<link>` and `<style>` nodes.
  This new behavior makes it possible to target a shadow host or root element
  without manually getting the document-level custom property values first.

- Fixed custom property values not persisting when CSS being processed contains
  only custom properties.

- Fixed ‘document is not defined’ error in SSR environment introduced in 1.10.0.

## 1.10.0

*2018-09-28*

- Added `options.rootElement` for specifying the root element to traverse for
  `<link>` and `<style>` nodes.

- Added `options.shadowDOM` to determine if shadow DOM `<link>` and `<style>`
  nodes should be processed.

- Added `cssVariables` argument to `options.onComplete` callback.

## 1.9.0

*2018-08-07*

- Added check for non-browser environments to support Node+SSR. (#16)

- Fixed keyframe animation fix by adding vendor prefixes for `animation-name`
  and `@keyframes`.

- Fixed internal placeholder comments appearing in CSS output instead of
  stylesheet content. (#15)

- Fixed multiple var() functions resolving to `undefined` when they do not
  resolve to a custom property or fallback value. (#18)

## 1.8.0

*2018-07-12*

- Added `options.watch` feature which creates a MutationObserver that will
  execute the ponyfill when a `<link>` or `<style>` DOM mutation is observed.
  (#8)

- Added fix for browser-related bugs that prevent keyframe animations from being
  applied when values are initially set using custom properties or updated using
  the `variables` ponyfill options. (#13)

- Fixed inaccurate “variable is undefined” console warning when a custom
  property value is `0` or `false`.

## 1.7.2

*2018-05-20*

- Changed `options.onError` callback `url` argument so that it always returns an
  absolute URL.

- Updated README with `options.onError` fixes and a few other minor tweaks.

## 1.7.1

*2018-05-19*

- Fixed `options.onError` message sent to console so that a URL is included when
  the status code is `0`. Also added a hint that these errors are possibly
  related to CORS restrictions to assist debugging efforts.

- Updated README with performance tips and better examples for `options.include`
  and `options.exclude`.

## 1.7.0

*2018-05-18*

- Added optimization that allows the ponyfill to skip processing of `<link>` and
  `<style>` data that does not contain a CSS custom property declaration or
  function. (#9)

## 1.6.0

*2018-05-17*

- Added `options.updateURLs` for converting relative `url()` paths to absolute
  urls. (#8)

## 1.5.0

*2018-05-16*

- Added `options.onBeforeSend` callback. (#7)

- Changed `options.onSuccess` callback so that it is called after CSS data has
  been collected from each node before CSS custom properties have been
  transformed.

## 1.4.0

*2018-04-23*

- Updated `get-css-data` dependency to 1.2.0 to resolve a callback related bug.

- Changed logic for inserting generated `<style>` element. Element is now
  inserted after the last `<style>` or `<link>` node processed. This
  change, combined with the proceeding change, ensures that the original cascade
  order is maintained after the transformed styles are appended to the DOM.

- Changed `options.onlyVars` default value from `true` to `false`. This
  change, combined with the preceding change, ensures that the original cascade
  order is maintained after the transformed styles are appended to the DOM.

## 1.3.0

*2018-04-17*

- Added `fixNestedCalc` option to remove nested `calc` keywords for legacy
  browser compatibility.

## 1.2.2

*2018-03-24*

- Updated README Examples section.

## 1.2.1

*2018-03-20*

- Updated README Examples section.

## 1.2.0

*2018-03-20*

- Fixed "Cannot read property 'length' of undefined" bug triggered while
  filtering comments that are a direct descendant of an at-rule. (#1)

## 1.1.2

*2018-03-12*

- Updated README browser support table.

## 1.1.1

*2018-03-12*

- Updated README: Added TOC, added demo link, added browser support table,
  updated examples.

## 1.1.0

*2018-02-08*

- Fixed bug that prevented `options.onlyVars` from properly filtering
  declarations that do not contain a custom property value or function.

- Changed `options.preserve` default value from `true` to `false`. This aligns
  with other default values which assume a "legacy-only" configuration.

- Changed logic for inserting generated `<style>` element. Element is now
  inserted as first CSS source node rather than the last. This allows the
  cascade order to be maintained when `options.onlyVars` is `true`.

## 1.0.0

*2018-01-31*

- Initial release
