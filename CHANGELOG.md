# Change Log

## 1.4.0

*2018-04-21*

- Updated logic for inserting generated `<style>` element. Element is now
  inserted after the last `<style>` or `<link>` node processed. This
  change, combined with the proceeding change, ensures that the original cascade
  order is maintained after the transformed styles are appended to the DOM.

- Updated `options.onlyVars` default value from `true` to `false`. This
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
  filtering comments that are a direct descendant of an at-rule.

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

- Updated `options.preserve` default value from `true` to `false`. This aligns
  with other default values which assume a "legacy-only" configuration.

- Updated logic for inserting generated `<style>` element. Element is now
  inserted as first CSS source node rather than the last. This allows the
  cascade order to be maintained when `options.onlyVars` is `true`.

## 1.0.0

*2018-01-31*

- Initial release
