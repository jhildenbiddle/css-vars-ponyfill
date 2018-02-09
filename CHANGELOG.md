# Change Log

## 1.1.0 - 2018-02-08

**Fixed**

- Fixed bugs in transform-css.js that prevented options.onlyVars from properly
  filtering declarations that do not contain a custom property value or
  function.

**Changed**

- Changed `options.preserve` default value from `true` to `false` to align with
  other defaults which assume a "legacy-only" configuration.
- Changed insert logic for generated `<style>` element (now inserted as first
  CSS source node rather than the last). This allows the cascade order to be
  maintained when settings `options.onlyVars` to `true`.

## 1.0.0 - 2018-01-31

**Added**

- Initial release
