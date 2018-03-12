# Change Log

## 1.1.1 - 2018-03-12

**Changed**

- Updated README: Added TOC, added demo link, added browser support table,
  updated examples.

## 1.1.0 - 2018-02-08

**Fixed**

- Fixed bug that prevented `options.onlyVars` from properly filtering
  declarations that do not contain a custom property value or function.

**Changed**

- `options.preserve` default value changed from `true` to `false`. This aligns
  with other default values which assume a "legacy-only" configuration.
- Generated `<style>` element is now inserted as first CSS source node rather
  than the last. This allows the cascade order to be maintained when
  `options.onlyVars` is `true`.

## 1.0.0 - 2018-01-31

**Added**

- Initial release
