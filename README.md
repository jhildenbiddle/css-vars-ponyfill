# css-vars-ponyfill

[![NPM](https://img.shields.io/npm/v/css-vars-ponyfill.svg?style=flat-square)](https://www.npmjs.com/package/css-vars-ponyfill)
[![Build Status](https://img.shields.io/travis/jhildenbiddle/css-vars-ponyfill.svg?style=flat-square)](https://travis-ci.org/jhildenbiddle/css-vars-ponyfill)
[![Codacy grade](https://img.shields.io/codacy/grade/5d967da1e518489aac42d99b87088671.svg?style=flat-square)](https://www.codacy.com/app/jhildenbiddle/css-vars-ponyfill?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=jhildenbiddle/css-vars-ponyfill&amp;utm_campaign=Badge_Grade)
[![Codecov](https://img.shields.io/codecov/c/github/jhildenbiddle/css-vars-ponyfill.svg?style=flat-square)](https://codecov.io/gh/jhildenbiddle/css-vars-ponyfill)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://github.com/jhildenbiddle/css-vars-ponyfill/blob/master/LICENSE)
[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=Client-side%20legacy%20support%20for%20CSS%20custom%20properties%20(%22CSS%20variables%22)&url=https%3A%2F%2Fgithub.com%2Fjhildenbiddle%2Fcss-vars-ponyfill&hashtags=css,developers,frontend,javascript)

A [ponyfill](https://ponyfill.com/) that provides client-side support for [CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) (aka "CSS variables") in legacy browsers.

- [Demo / Playground](https://codepen.io/jhildenbiddle/pen/ZxYJrR/) (CodePen)

------

- [Features](#features)
- [Installation](#installation)
- [Examples](#examples)
- [Options](#options)
- [Attribution](#attribution)
- [Contact](#contact)
- [License](#license)

------

## Features

- Client-side transformation of CSS custom properties to static values
- Live updates of runtime values in both modern and legacy browsers
- Transforms `<style>`,  `<link>`, and `@import` CSS
- Supports chained custom property references
- Supports complex values
- Supports fallback values
- UMD and ES6 module available
- Lightweight (less than 5k min+gzip) and dependency-free

**Limitations**

- Custom property support is limited to `:root` declarations
- The use of `var()` is limited to property values (per [W3C specification](https://www.w3.org/TR/css-variables/))

**Browser Support**

| IE   | Edge | Chrome | Firefox | Safari |
| ---- | ---- | ------ | ------- | ------ |
| 9+   | 12+  | 19+    | 6+      | 6+     |

## Installation

NPM:

```shell
npm i css-vars-ponyfill
```

Git:

```shell
git clone https://github.com/jhildenbiddle/css-vars-ponyfill.git
```

CDN (minified UMD via [unpkg](https://unpkg.com/css-vars-ponyfill/dist/) or [jsdelivr](https://www.jsdelivr.com/package/npm/css-vars-ponyfill)):

```html
<!-- Latest version -->
<script src="https://unpkg.com/css-vars-ponyfill"></script>

<!-- Latest v1.x.x -->
<script src="https://unpkg.com/css-vars-ponyfill@1"></script>
```

## Examples

HTML / CSS:

```html
<!-- file.html -->

<link rel="stylesheet" href="style.css">
<style>
  :root {
    --color: black;
  }
</style>
```

```css
/* style.css */

:root {
  /* Chained references */
  --a: var(--b);
  --b: var(--c);
  --c: 10px;
}

div {
  /* External value (from <style>) */
  color: var(--color);

  /* Fallback */
  margin: var(--unknown, 20px);

  /* Complex value */
  padding: calc(2 * var(--a));
}
```

JavaScript (see [Options](#options)):

```javascript
import cssVars from 'css-vars-ponyfill';

// Call using defaults
cssVars();

// Or call with options
cssVars({
  // ...
});
```

CSS is fetched, parsed, transformed, and prepended to `<head>`:

```html
<style id="css-vars-ponyfill">
  div {
    color: black;
    margin: 20px;
    padding: calc(2 * 10px);
  }
</style>
```

To update values, call `cssVars()` with [options.variables](#optionsvariables):

```javascript
cssVars({
  variables: {
    color: 'red',
    unknown: '5px'
  }
});
```

Updated values are applied in both legacy and modern browsers:

- Legacy browsers will parse, transform, and prepend CSS to the `<head>` element once again.

   ```html
   <style id="css-vars-ponyfill">
     div {
       color: red;
       margin: 5px;
       padding: calc(2 * 10px);
     }
   </style>
   ```

- Modern browsers with native custom property support will update using the [style.setProperty()](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/setProperty) interface.

   ```javascript
   document.documentElement.style.setProperty('--color', 'red');
   document.documentElement.style.setProperty('--unknown', '5px');
   ```

## Options

- [include](#optionsinclude)
- [exclude](#optionsexclude)
- [fixNestedCalc](#optionsfixnestedcalc)
- [onlyLegacy](#optionsonlylegacy)
- [onlyVars](#optionsonlyvars)
- [preserve](#optionspreserve)
- [silent](#optionssilent)
- [updateDOM](#optionsupdatedom)
- [variables](#optionsvariables)
- [onSuccess](#optionsonsuccess)
- [onError](#optionsonerror)
- [onWarning](#optionsonwarning)
- [onComplete](#optionsoncomplete)

**Example**

```javascript
// Default values shown
cssVars({
  include      : 'link[rel=stylesheet],style',
  exclude      : '',
  fixNestedCalc: true,
  onlyLegacy   : true,
  onlyVars     : true,
  preserve     : false,
  silent       : false,
  updateDOM    : true,
  variables    : {
    // ...
  },
  onSuccess(cssText) {
    // ...
  },
  onError(message, node) {
    // ...
  },
  onWarning(message) {
    // ...
  },
  onComplete(cssText, styleNode) {
    // ...
  }
});
```

### options.include

- Type: `string`
- Default: `"link[rel=stylesheet],style"`

CSS selector matching `<link rel="stylesheet">` and `<style>` nodes to process. The default value includes all style and link nodes.

**Example**

```javascript
cssVars({
  // Include only <link rel="stylesheet"> nodes
  // with an href that does not contains "bootstrap"
  include: 'link[rel=stylesheet]:not([href*=bootstrap])'
});
```

### options.exclude

- Type: `string`
- Default: *none*

CSS selector matching `<link rel="stylesheet">` and `<style>` nodes to exclude from those matched by [options.include](#optionsinclude).

**Example**

```javascript
cssVars({
  // Of matched 'include' nodes, exclude any node
  // with an href that contains "bootstrap"
  exclude: '[href*=bootstrap]'
});
```

### options.fixNestedCalc

- Type: `boolean`
- Default: `true`

Determines if nested `calc` keywords will be removed for compatibility with legacy browsers.

**Example**

CSS:

```css
:root {
  --a: calc(1px + var(--b));
  --b: calc(2px + var(--c));
  --c: calc(3px + var(--d));
  --d: 4px;
}
p {
  margin: var(--a);
}
```

JavaScript:

```javascript
cssVars({
  fixNestedCalc: true // default
});
```

Output when `fixNestedCalc: true`

```css
p {
  /* Works in legacy browsers */
  margin: calc(1px + (2px + (3px + 4)));
}
```

Output when `fixNestedCalc: false`

```css
p {
  /* Does not work in legacy browsers */
	margin: calc(1px + calc(2px + calc(3px + 4)));
}
```

### options.onlyLegacy

- Type: `boolean`
- Default: `true`

Determines if the ponyfill will only generate legacy-compatible CSS in browsers that lack native support (i.e., legacy browsers).

When `true`, the ponyfill will only generate legacy-compatible CSS, trigger callbacks, and (optionally) update the DOM in browsers that lack native support. When `false`, the ponyfill will treat all browsers as legacy, regardless of their support for CSS custom properties.

**Example**

```javascript
cssVars({
  onlyLegacy: true // default
});
```

### options.onlyVars

- Type: `boolean`
- Default: `true`

Determines if CSS rulesets and declarations without a custom property value should be removed from the transformed CSS.

When `true`, rulesets and declarations without a custom property value will be removed from the generated CSS, reducing CSS output size. When `false`, all rulesets and declarations will be retained in the generated CSS.

**Note:** `@font-face` and `@keyframes` require all declarations to be retained if a CSS custom property is used anywhere within the ruleset.

**Example**

CSS:

```css
:root {
  --color: red;
}
h1 {
  font-weight: bold;
}
p {
  margin: 20px;
  padding: 10px;
  color: var(--color);
}
```

JavaScript:

```javascript
cssVars({
  onlyVars: true // default
});
```

Output when `onlyVars: true`

```css
p {
  color: red;
}
```

Output when `onlyVars: false`

```css
h1 {
  font-weight: bold;
}
p {
  margin: 20px;
  padding: 10px;
  color: red;
}
```

### options.preserve

- Type: `boolean`
- Default: `false`

Determines if the original CSS custom property declaration will be retained in the transformed CSS.

When `true`, the original custom property declarations are available in the transformed CSS along with their static values. When `false`, only static values are available in the transformed CSS.

**Example**

CSS:

```css
:root {
  --color: red;
}
p {
  color: var(--color);
}
```

JavaScript:

```javascript
cssVars({
  preserve: false // default
});
```

Output when `preserve: false`

```css
p {
  color: red;
}
```

Output when `preserve: true`

```css
:root {
  --color: red;
}
p {
  color: red;
  color: var(--color);
}
```

### options.silent

- Type: `boolean`
- Default: `false`

Determines if warning and error messages will be displayed on the console.

When `true`, messages will be displayed on the console for each warning and error encountered while processing CSS. When `false`, messages will not be displayed on the console but will still be available using the [options.onWarning](#optionsonwarning) and [options.onSuccess](#optionsonsuccess) callbacks.

**Example**

CSS:

```css
@import "fail.css"

p {
  color: var(--fail);
}

p {
  color: red;

```

JavaScript:

```javascript
cssVars({
  silent: false // default
});
```

Console:

```bash
> CSS XHR error: "fail.css" 404 (Not Found)
> CSS transform warning: variable "--fail" is undefined
> CSS parse error: missing "}"
```

### options.updateDOM

- Type: `boolean`
- Default: `true`

Determines if the ponyfill will update the DOM after processing CSS custom properties.

When `true`, legacy browsers will have a `<style>` node with transformed CSS prepended to the `<head>`, while browsers with native support will apply [options.variables](#optionsvariabls) custom properties using the native  [style.setProperty()](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/setProperty) method. When `false`, the DOM will not be updated by the polyfill in either modern or legacy browsers, but transformed CSS can be accessed with either the [options.onSuccess](#optionsonsuccess) or [options.onComplete](#optionsoncomplete) callback.

**Example**

HTML:

```html
<head>
  <title>Title</title>
  <link rel="stylesheet" href="style.css">
</head>
```

JavaScript:

```javascript
cssVars({
  updateDOM: true // default
});
```

Result when `updateDOM: true`

```html
<head>
  <title>Title</title>
  <style id="css-vars-ponyfill">
    /* Transformed CSS ... */
  </style>
  <link rel="stylesheet" href="style.css">
</head>
```

### options.variables

- Type: `object`
- Default: `{}`

A map of custom property name/value pairs. Property names can omit or include the leading double-hyphen (`--`), and values specified will override previous values.

Legacy browsers will process these values while generating legacy-compatible CSS. Modern browsers with native custom property support will apply these values using the native [setProperty()](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/setProperty) method when [options.updateDOM](#optionsupdatedom) is `true`.

**Example**

```javascript
cssVars({
  variables: {
    color1    : 'red',
    '--color2': 'green'
  }
});
```

### options.onSuccess

- Type: `function`
- Arguments:
  1. **cssText**: A `string` of CSS text from `node` and `url`

Callback after all CSS has been processed and legacy-compatible CSS has been generated, but *before* the legacy CSS has been appended to the DOM. Allows modifying the CSS data by returning any `string` value (or `false` to skip) before [options.onComplete](#optionsoncomplete) is triggered.

**Example**

```javascript
const beautifyCss = require('js-beautify').css;

cssVars({
  onSuccess(cssText, node, url) {
    // Beautify CSS
    return beautifyCss(cssText);
  }
});
```

### options.onError

- Type: `function`
- Arguments:
  1. **message**: The error message
  2. **node**: The source node `object` reference
  3. **xhr**: The XHR `object` containing details of the failed request
  4. **url**: The source URL `string` (`<link>` href or `@import` url)

Callback after a CSS parsing error has occurred or an XHR request has failed.

**Example**

HTML:

```css
<link rel="stylesheet" href="path/to/fail.css">
```

JavaScript:

```javascript
cssVars({
  onError(message, node, xhr) {
    console.log(message); // 1
    console.log(node); // 2
    console.log(xhr.status); // 3
    console.log(xhr.statusText); // 4
    console.log(url); // 5
  }
});

// 1 => 'CSS XHR error: "fail.css" 404 (Not Found)'
// 2 => <link rel="stylesheet" href="path/to/fail.css">
// 3 => '404'
// 4 => 'Not Found'
// 5 => 'path/to/fail.css'
```

### options.onWarning

- Type: `function`
- Arguments:
  1. **message**: The warning message

Callback after each CSS parsing warning has occurred.

**Example**

CSS:

```css
p {
  color: var(--fail);
}
```

JavaScript:

```javascript
cssVars({
  onWarning(message) {
    console.log(message); // 1
  }
});

// 1 => 'CSS transform warning: variable "--fail" is undefined'
```

### options.onComplete

- Type: `function`
- Arguments:
  1. **cssText**: A `string` of concatenated CSS text from all nodes in DOM order
  2. **styleNode**: An `object` reference to the appended `<style>` node

Callback after all CSS has been processed, legacy-compatible CSS has been generated, and (optionally) the DOM has been updated.

**Example**

```javascript
cssVars({
  onComplete(cssText, styleNode) {
    // ...
  }
});
```

## Attribution

This ponyfill includes code based on the following projects. Many thanks to the authors and contributors for helping to make this project possible.

- [**rework-vars**](https://github.com/reworkcss/rework-vars) by [reworkcss](https://github.com/reworkcss)
- [**rework-visit**](https://github.com/reworkcss/rework-visit) by [reworkcss](https://github.com/reworkcss)
- [**Simple CSS Parser**](https://github.com/NxtChg/pieces/tree/master/js/css_parser) by [NxChg](https://github.com/NxtChg)

## Contact

- Create a [Github issue](https://github.com/jhildenbiddle/css-vars-ponyfill/issues) for bug reports, feature requests, or questions
- Follow [@jhildenbiddle](https://twitter.com/jhildenbiddle) for announcements
- Add a [star on GitHub](https://github.com/jhildenbiddle/css-vars-ponyfill) or [tweet](https://twitter.com/intent/tweet?text=Client-side%20legacy%20support%20for%20CSS%20custom%20properties%20(%22CSS%20variables%22)&url=https%3A%2F%2Fgithub.com%2Fjhildenbiddle%2Fcss-vars-ponyfill&hashtags=css,developers,frontend,javascript) to support the project!

## License

This project is licensed under the MIT License. See the [MIT LICENSE](https://github.com/jhildenbiddle/css-vars-ponyfill/blob/master/LICENSE) for details.

Copyright (c) 2018 John Hildenbiddle ([@jhildenbiddle](https://twitter.com/jhildenbiddle))