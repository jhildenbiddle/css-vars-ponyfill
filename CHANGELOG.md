# Change Log

## 1.3.0 - 2018-04-17

**Added**

- Added `fixNestedCalc` option to remove nested `calc` keywords for legacy
  browser compatibility.

## 1.2.2 - 2018-03-24

**Changed**

- Updated README Examples section.

## 1.2.1 - 2018-03-20

**Changed**

- Updated README Examples section.

## 1.2.0 - 2018-03-20

**Fixed**

- Fixed "Cannot read property 'length' of undefined" bug triggered while
  filtering comments that are a direct descendant of an at-rule.

## 1.1.2 - 2018-03-12

**Changed**

- Updated README browser support table.

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
