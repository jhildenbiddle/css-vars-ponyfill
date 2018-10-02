# css-vars-ponyfill

[![NPM](https://img.shields.io/npm/v/css-vars-ponyfill.svg?style=flat-square)](https://www.npmjs.com/package/css-vars-ponyfill)
[![Build Status](https://img.shields.io/travis/jhildenbiddle/css-vars-ponyfill/master.svg?style=flat-square)](https://travis-ci.org/jhildenbiddle/css-vars-ponyfill)
[![Codacy](https://img.shields.io/codacy/grade/5d967da1e518489aac42d99b87088671.svg?style=flat-square)](https://www.codacy.com/app/jhildenbiddle/css-vars-ponyfill?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=jhildenbiddle/css-vars-ponyfill&amp;utm_campaign=Badge_Grade)
[![Codecov](https://img.shields.io/codecov/c/github/jhildenbiddle/css-vars-ponyfill.svg?style=flat-square)](https://codecov.io/gh/jhildenbiddle/css-vars-ponyfill)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://github.com/jhildenbiddle/css-vars-ponyfill/blob/master/LICENSE)
[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?url=https%3A%2F%2Fgithub.com%2Fjhildenbiddle%2Fcss-vars-ponyfill&hashtags=css,developers,frontend,javascript)

A [ponyfill](https://ponyfill.com/) that provides client-side support for [CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) (aka "CSS variables") in legacy browsers.

- [Demo](https://codepen.io/jhildenbiddle/pen/ZxYJrR/) (CodePen)

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
- Auto-updates on `<link>` and `<style>` changes
- Transforms `<link>`, `<style>`, and `@import` CSS
- Transforms shadow DOM `<link>` and `<style>` CSS
- Transforms relative `url()` paths to absolute URLs
- Supports chained custom property references
- Supports complex values
- Supports fallback values
- UMD and ES6 module available
- Lightweight (5k min+gzip) and dependency-free

**Limitations**

- Custom property support is limited to `:root` declarations
- The use of `var()` is limited to property values (per [W3C specification](https://www.w3.org/TR/css-variables/))

**Browser Support**

| IE   | Edge | Chrome | Firefox | Safari |
| ---- | ---- | ------ | ------- | ------ |
| 9+   | 12+  | 19+    | 6+      | 6+     |

## Installation

NPM:

```bash
npm install css-vars-ponyfill
```

Git:

```bash
git clone https://github.com/jhildenbiddle/css-vars-ponyfill.git
```

CDN ([unpkg.com](https://unpkg.com/) shown, also on [jsdelivr.net](https://www.jsdelivr.com/)):

```html
<!-- file.html (latest v1.x.x) -->

<script src="https://unpkg.com/css-vars-ponyfill@1"></script>
<script>
  cssVars({
    // ...
  });
</script>
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

// Call with options
cssVars({
  // ...
});
```

The ponyfill will:

1. Get the `<link>`, `<style>`, and `@import` CSS
1. Parse the CSS and convert it to an abstract syntax tree
1. Transform CSS custom properties to static values
1. Transforms relative `url()` paths to absolute URLs
1. Convert the AST back to CSS
1. Append legacy-compatible CSS to the DOM

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

Values will be updated in both legacy and modern browsers:

- In legacy browsers, the ponyfill will get, parse, transform, and append
  legacy-compatible CSS to the DOM once again.

   ```html
   <style id="css-vars-ponyfill">
     div {
       color: red;
       margin: 5px;
       padding: calc(2 * 10px);
     }
   </style>
   ```

- In modern browsers with native support for CSS custom properties, the ponyfill will update values using the [style.setProperty()](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/setProperty) interface.

   ```javascript
   document.documentElement.style.setProperty('--color', 'red');
   document.documentElement.style.setProperty('--unknown', '5px');
   ```

## Options

- [rootElement](#optionsrootelement)
- [include](#optionsinclude)
- [exclude](#optionsexclude)
- [fixNestedCalc](#optionsfixnestedcalc)
- [onlyLegacy](#optionsonlylegacy)
- [onlyVars](#optionsonlyvars)
- [preserve](#optionspreserve)
- [shadowDOM](#optionsshadowdom)
- [silent](#optionssilent)
- [updateDOM](#optionsupdatedom)
- [updateURLs](#optionsupdateurls)
- [variables](#optionsvariables)
- [watch](#optionswatch)
- [onBeforeSend](#optionsonbeforesend)
- [onSuccess](#optionsonsuccess)
- [onWarning](#optionsonwarning)
- [onError](#optionsonerror)
- [onComplete](#optionsoncomplete)

**Example**

```javascript
// All options (default values shown)
cssVars({
  rootElement  : document,
  include      : 'link[rel=stylesheet],style',
  exclude      : '',
  fixNestedCalc: true,
  onlyLegacy   : true,
  onlyVars     : false,
  preserve     : false,
  shadowDOM    : false,
  silent       : false,
  updateDOM    : true,
  updateURLs   : true,
  variables    : {
    // ...
  },
  watch        : false,
  onBeforeSend(xhr, node, url) {
    // ...
  },
  onSuccess(cssText, node, url) {
    // ...
  },
  onWarning(message) {
    // ...
  },
  onError(message, node, xhr, url) {
    // ...
  },
  onComplete(cssText, styleNode) {
    // ...
  }
});
```

### options.rootElement

- Type: `object`
- Default: `document`

Root element containing `<link rel="stylesheet">` and `<style>` nodes to process.

**Examples**

```javascript
// Document DOM
cssVars({
  rootElement: document // default
});

// Shadow DOM (not including nested shadow DOM trees)
cssVars({
  rootElement: document.querySelector('custom-element')
});

// Shadow DOM (including nested shadow DOM trees)
cssVars({
  rootElement: document.querySelector('custom-element'),
  shadowDOM  : true
});
```

### options.include

- Type: `string`
- Default: `"link[rel=stylesheet],style"`

CSS selector matching `<link rel="stylesheet">` and `<style>` nodes to process. The default value includes all style and link nodes.

**Tip:** The default value is the *safest* setting, but it is not necessarily the fastest. For the best performance, avoid unnecessary CSS processing by including only CSS that needs to be ponyfilled. See [options.exclude](#optionsexclude) for an alternate approach.

**Example**

```javascript
// Example 1: Include local CSS only
cssVars({
  // Include only CSS from <style> nodes and <link> nodes
  // with an href that does not contain "//"
  include: 'style,link[rel="stylesheet"]:not([href*="//"])'
});

// Example 2: Include via data attribute
cssVars({
  // Include ony CSS from <link> and <style> nodes with
  // a "data-cssvarsponyfill" attribute set to "true"
  // Ex: <link data-cssvarsponyfill="true" rel="stylesheet" href="...">
  // Ex: <style data-cssvarsponyfill="true">...</style>
  include: '[data-cssvarsponyfill="true"]'
});
```

### options.exclude

- Type: `string`
- Default: *none*

CSS selector matching `<link rel="stylesheet">` and `<style>` nodes to exclude from those matched by [options.include](#optionsinclude).

**Tip:** The default value is the *safest* setting, but it is not necessarily the fastest. For the best performance, avoid unnecessary CSS processing by excluding CSS that does not need to be ponyfilled. See [options.include](#optionsinclude) for an alternate approach.

**Example**

```javascript
// Example 1: Exclude based on <link> href
cssVars({
  // Of the matched 'include' nodes, exclude any node
  // with an href that contains "bootstrap"
  exclude: '[href*=bootstrap]'
});

// Example 2: Exclude via data attribute
cssVars({
  // Of the matched 'include' nodes, exclude any node
  // with a "data-cssvarsponyfill" attribute set to "false"
  // Ex: <link data-cssvarsponyfill="false" rel="stylesheet" href="...">
  // Ex: <style data-cssvarsponyfill="false">...</style>
  include: '[data-cssvarsponyfill="false"]'
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

Determines if the ponyfill will ignore modern browsers with native CSS custom property support.

When `true`, the ponyfill will only transform custom properties, generate CSS, and trigger callbacks in legacy browsers that lack native support. When `false`, the ponyfill will treat all browsers as legacy, regardless of their support for CSS custom properties.

**Example**

```javascript
cssVars({
  onlyLegacy: true // default
});
```

### options.onlyVars

- Type: `boolean`
- Default: `false`

Determines if CSS rulesets and declarations without a custom property value should be removed from the transformed CSS.

When `true`, rulesets and declarations without a custom property value will be removed from the generated CSS, reducing CSS output size. This can significantly reduce the amount of CSS processed and output by the ponyfill, but runs the risk of breaking the original cascade order once the transformed values are appended to the DOM. When `false`, all rulesets and declarations will be retained in the generated CSS. This means the ponyfill will process and output more CSS, but it ensures that the original cascade order is maintained after the transformed styles are appended to the DOM.

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

### options.shadowDOM

- Type: `boolean`
- Default: `false`

Determines if shadow DOM trees within the [options.rootElement](#optionsrootelement) will be processed.

**Example**

```javascript
// Do no process shadow DOM trees
cssVars({
  shadowDOM: false // default
});

// Process all shadow DOM trees (including nested)
cssVars({
  shadowDOM: true
});

// Process only specified shadowRoot (not nested shadow DOM trees)
cssVars({
  rootElement: document.querySelector('my-custom-element').shadowRoot,
});

// Process all shadow DOM trees within rootElement (including nested)
cssVars({
  rootElement: document.querySelector('my-custom-element'),
  shadowDOM  : true
});
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

When `true`, the ponyfill updates will be applied to the DOM. For legacy browsers, this is accomplished by appending a `<style>` node with transformed CSS after the last `<link>` or `<style>` node processed. For modern browsers, [options.variables](#optionsvariabls) values will be applied as custom property changes using the native [style.setProperty()](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/setProperty) method. When `false`, the DOM will not be updated by the polyfill in either modern or legacy browsers, but transformed CSS can be accessed with either the [options.onSuccess](#optionsonsuccess) or [options.onComplete](#optionsoncomplete) callback.

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
  <link rel="stylesheet" href="style.css">
  <style id="css-vars-ponyfill">
    /* Transformed CSS ... */
  </style>
</head>
```

### options.updateURLs

- Type: `boolean`
- Default: `true`

Determines if the ponyfill will convert relative `url()` paths to absolute urls.

When `true`, the ponyfill will parse each block of external CSS for relative `url()` paths and convert them to absolute URLs. This allows resources (images, fonts, etc.) referenced using paths relative to an external stylesheet to load properly when legacy-compatible CSS is generated and appended to the DOM by the ponyfill. When `false`, the ponyfill will not modify relative `url()` paths.

**Example**

CSS:

```css
/* http://mydomain.com/path/to/style.css */

div {
  background-image: url(image.jpg);
}
```

JavaScript:

```javascript
cssVars({
  updateURLs: true // default
});
```

Output when `updateURLs: true`

```css
div {
  background-image: url(http://mydomain.com/path/to/image.jpg);
}
```

Output when `updateURLs: false`

```css
div {
  background-image: url(image.jpg);
}
```

### options.variables

- Type: `object`
- Default: `{}`

A map of custom property name/value pairs to apply to both legacy and modern browsers. Property names can include or omit the leading double-hyphen (`--`). Values specified will override previous values.

Legacy browsers will process these values while generating legacy-compatible CSS. Modern browsers with native support for CSS custom properties will add/update these values using the [setProperty()](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/setProperty) method when [options.updateDOM](#optionsupdatedom) is `true`.

**Note:** Although this option affects both legacy and modern browsers, ponyfill callbacks like (e.g. [onComplete](#oncomplete)) will only be triggered in legacy browsers (or in modern browsers when [onlyLegacy](#optionsonlylegacy) is `false`).

**Example**

```javascript
cssVars({
  variables: {
    '--color1': 'red',  // Leading -- included
    'color2'  : 'green' // Leading -- omitted
  }
});
```

### options.watch

- Type: `boolean`
- Default: `false`

Determines if a [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) will be created to watch for `<link>` and `<style>` DOM mutations.

When `true`, the ponyfill will call itself when a `<link>` or `<style>` node is added, removed, or has its `disabled` or `href` attribute modified. The settings used will be the same as those passed to the ponyfill the first time `options.watch` was set to `true`.

**Note:** This feature requires native [support for MutationObserver](https://caniuse.com/#feat=mutationobserver) or a [polyfill](https://polyfill.io/v2/docs/) for legacy browsers.

**Example**

```javascript
cssVars({
  watch: false // default
});
```

### options.onBeforeSend

- Type: `function`
- Arguments:
  1. **xhr**: The XHR `object` containing details of the failed request
  1. **node**: The source node `object` reference
  1. **url**: The source URL `string` (`<link>` href or `@import` url)

Callback before each [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) (XHR) is sent. Allows modifying the XML object by setting properties, calling methods, or adding event handlers.

**Example**

```javascript
cssVars({
  onBeforeSend(xhr, node, url) {
    // Domain-specific XHR settings
    if (/some-domain.com/.test(url)) {
      xhr.withCredentials = true;
      xhr.setRequestHeader("foo", "1");
      xhr.setRequestHeader("bar", "2");
    }
  }
});
```

### options.onSuccess

- Type: `function`
- Arguments:
  1. **cssText**: A `string` of CSS text from `node` and `url`
  1. **node**: The source node `object` reference
  1. **url**: The source URL `string` (`<link>` href, `@import` url, or page url for `<style>` data)

Callback after CSS data has been collected from each node and *before* CSS custom properties have been transformed. Allows modifying the CSS data before it is transformed by returning any `string` value (or `false` to skip).

**Note:** The order in which `<link>` and `@import` CSS data is "successfully" collected (thereby triggering this callback) is not guaranteed as these requests are asynchronous.

**Example**

```javascript
cssVars({
  onSuccess(cssText, node, url) {
    // Replace all instances of "color: red" with "color: blue"
    const newCssText = cssText.replace(/color:\s*red\s;/g, 'color: blue;');

    return newCssText;
  }
});
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

### options.onError

- Type: `function`
- Arguments:
  1. **message**: The error message
  1. **node**: The source node `object` reference
  1. **xhr**: The XHR `object` containing details of the failed request
  1. **url**: The source URL `string` (`<link>` href or `@import` url)

Callback after a CSS parsing error has occurred or an XHR request has failed.

**Example**

HTML:

```css
<link rel="stylesheet" href="path/to/fail.css">
```

JavaScript:

```javascript
cssVars({
  onError(message, node, xhr, url) {
    console.log(message); // 1
    console.log(node); // 2
    console.log(xhr.status); // 3
    console.log(xhr.statusText); // 4
    console.log(url); // 5
  }
});

// 1 => 'CSS XHR error: "http://domain.com/path/to/fail.css" 404 (Not Found)'
// 2 => <link rel="stylesheet" href="path/to/fail.css">
// 3 => '404'
// 4 => 'Not Found'
// 5 => 'http://domain.com/path/to/fail.css'
```

### options.onComplete

- Type: `function`
- Arguments:
  1. **cssText**: A `string` of concatenated CSS text from all nodes in DOM order
  1. **styleNode**: An `object` reference to the appended `<style>` node
  1. **cssVariables**: An `object` containing CSS custom property names and values

Callback after all CSS has been processed, legacy-compatible CSS has been generated, and (optionally) the DOM has been updated.

**Example**

```javascript
cssVars({
  onComplete(cssText, styleNode, cssVariables) {
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
- Add a ⭐️ [star on GitHub](https://github.com/jhildenbiddle/css-vars-ponyfill) or ❤️ [tweet](https://twitter.com/intent/tweet?url=https%3A%2F%2Fgithub.com%2Fjhildenbiddle%2Fcss-vars-ponyfill&hashtags=css,developers,frontend,javascript) to support the project!

## License

This project is licensed under the MIT License. See the [MIT LICENSE](https://github.com/jhildenbiddle/css-vars-ponyfill/blob/master/LICENSE) for details.

Copyright (c) 2018 John Hildenbiddle ([@jhildenbiddle](https://twitter.com/jhildenbiddle))
