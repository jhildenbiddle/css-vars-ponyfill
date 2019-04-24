# css-vars-ponyfill

[![NPM](https://img.shields.io/npm/v/css-vars-ponyfill.svg?style=flat-square)](https://www.npmjs.com/package/css-vars-ponyfill)
[![Build Status](https://img.shields.io/travis/jhildenbiddle/css-vars-ponyfill/master.svg?style=flat-square)](https://travis-ci.org/jhildenbiddle/css-vars-ponyfill)
[![Codacy](https://img.shields.io/codacy/grade/5d967da1e518489aac42d99b87088671.svg?style=flat-square)](https://www.codacy.com/app/jhildenbiddle/css-vars-ponyfill?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=jhildenbiddle/css-vars-ponyfill&amp;utm_campaign=Badge_Grade)
[![Codecov](https://img.shields.io/codecov/c/github/jhildenbiddle/css-vars-ponyfill.svg?style=flat-square)](https://codecov.io/gh/jhildenbiddle/css-vars-ponyfill)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://github.com/jhildenbiddle/css-vars-ponyfill/blob/master/LICENSE)
[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/css-vars-ponyfill/badge)](https://www.jsdelivr.com/package/npm/css-vars-ponyfill)
[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?url=https%3A%2F%2Fgithub.com%2Fjhildenbiddle%2Fcss-vars-ponyfill&hashtags=css,developers,frontend,javascript)

A [ponyfill](https://ponyfill.com/) that provides client-side support for [CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) (aka "CSS variables") in legacy and modern browsers.

- [Demo](https://codepen.io/jhildenbiddle/pen/ZxYJrR/) (CodePen)

## Features

- Client-side transformation of CSS custom properties to static values
- Live updates of runtime values in both modern and legacy browsers
- Transforms `<link>`, `<style>`, and `@import` CSS
- Transforms relative `url()` paths to absolute URLs
- Supports chained and nested `var()` functions
- Supports `var()` function fallback values
- Supports web components / shadow DOM CSS
- Watch mode auto-updates on `<link>` and `<style>` changes
- UMD and ES6 module available
- TypeScript definitions included
- Lightweight (6k min+gzip) and dependency-free

**Limitations**

- Custom property support is limited to `:root` declarations
- The use of `var()` is limited to property values (per [W3C specification](https://www.w3.org/TR/css-variables/))

**Browser Support**

<img src="https://icongr.am/devicon/chrome-original.svg?size=19" style="margin-right: 0.4em; vertical-align: text-bottom;"> Chrome 19+
<br>
<img src="https://icongr.am/simple/microsoftedge.svg?size=19&colored=true" style="margin-right: 0.4em; vertical-align: text-bottom;"> Edge 12+
<br>
<img src="https://icongr.am/devicon/firefox-original.svg?size=19" style="margin-right: 0.4em; vertical-align: text-bottom;"> Firefox 6+
<br>
<img src="https://icongr.am/simple/internetexplorer.svg?size=19&colored=true" style="margin-right: 0.4em; vertical-align: text-bottom;"> IE 9+
<br>
<img src="https://icongr.am/devicon/safari-original.svg?size=19" style="margin-right: 0.4em; vertical-align: text-bottom;"> Safari 6+

## Installation

NPM:

```bash
npm install css-vars-ponyfill
```

Git:

```bash
git clone https://github.com/jhildenbiddle/css-vars-ponyfill.git
```

CDN ([jsdelivr.com](https://www.jsdelivr.com/) shown, also on [unpkg.com](https://unpkg.com/)):

```html
<!-- Latest v2.x.x -->
<script src="https://cdn.jsdelivr.net/npm/css-vars-ponyfill@2"></script>
```

## Examples

HTML:

```html
<link rel="stylesheet" href="style.css">
<style>
  :root {
    --color: black;
  }
</style>
```

CSS (from `style.css`):

```css
:root {
  --a: var(--b); /* Chained */
  --b: var(--c);
  --c: 10px;
}

div {
  color: var(--color); /* from <style> */
  margin: var(--unknown, 20px); /* Fallback */
  padding: calc(2 * var(--a)); /* Nested */
}
```

JavaScript (see [Options](#options)):

```javascript
import cssVars from 'css-vars-ponyfill';

cssVars({
  // Options ...
});
```

For each `<link>` and `<style>` element processed the ponyfill will:

1. Get the CSS content (including `@import` CSS)
1. Parse the CSS and convert it to an AST
1. Transform CSS custom properties to static values
1. Transforms relative `url()` paths to absolute URLs
1. Fix nested `calc()` functions
1. Convert the AST back to CSS
1. Append legacy-compatible CSS to the DOM

```html
<!-- Output -->
<style data-cssvars="out">
  div {
    color: black;
    margin: 20px;
    padding: calc(2 * 10px);
  }
</style>
```

To update values:

- Use [options.watch](#watch) to detect `<link>` and `<style>` mutations and auto-update transformed CSS
- Manually call the ponyfill after a `<link>` or `style` node has been added or removed
- Manually call the ponyfill with [options.variables](#variables):

Example:

```javascript
cssVars({
  variables: {
    color: 'red',
    unknown: '5px'
  }
});
```

Values will be updated in both legacy and modern browsers:

- In legacy browsers (and modern browsers when [options.onlyLegacy](#onlylegacy) is `false`), the ponyfill will determine if the changes affect the previously transformed CSS for each `<link>` and `<style>` element previously processed. If they do, CSS will be transformed once again with the new values and the output `<style>` element will be updated.

   ```html
   <!-- Output (updated) -->
   <style data-cssvars="out">
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

**Targets**

- [rootElement](#rootelement)
- [shadowDOM](#shadowdom)

**Sources**

- [include](#include)
- [exclude](#exclude)
- [variables](#variables)

**Options**

- [onlyLegacy](#onlylegacy)
- [preserveStatic](#preservestatic)
- [preserveVars](#preservevars)
- [silent](#silent)
- [updateDOM](#updatedom)
- [updateURLs](#updateurls)
- [watch](#watch)

**Callbacks**

- [onBeforeSend](#onbeforesend)
- [onWarning](#onwarning)
- [onError](#onerror)
- [onSuccess](#onsuccess)
- [onComplete](#oncomplete)

**Example**

```javascript
// Default values
cssVars({
  // Targets
  rootElement   : document,
  shadowDOM     : false,

  // Sources
  include       : 'link[rel=stylesheet],style',
  exclude       : '',
  variables     : {},

  // Options
  onlyLegacy    : true,
  preserveStatic: true,
  preserveVars  : false,
  silent        : false,
  updateDOM     : true,
  updateURLs    : true,
  watch         : false,

  // Callbacks
  onBeforeSend(xhr, elm, url) {
    // ...
  },
  onWarning(message) {
    // ...
  },
  onError(message, elm, xhr, url) {
    // ...
  },
  onSuccess(cssText, elm, url) {
    // ...
  },
  onComplete(cssText, styleElms, cssVariables, benchmark) {
    // ...
  }
});
```

### rootElement

- Type: `object`
- Default: `document`

Root element containing `<link>` and `<style>` elements to process.

**Example**

```javascript
// Document
cssVars({
  rootElement: document // default
});

// Shadow DOM
cssVars({
  rootElement: document.querySelector('custom-element').shadowRoot
});
```

### shadowDOM

- Type: `boolean`
- Default: `false`

Determines if shadow DOM tree(s) nested within the [options.rootElement](#rootelement) will be processed.

**Example**

```javascript
// Do no process shadow DOM trees
cssVars({
  shadowDOM: false // default
});

// Process all shadow DOM trees in document
cssVars({
  shadowDOM: true
});

// Process all shadow DOM trees in custom element
cssVars({
  rootElement: document.querySelector('my-element'),
  shadowDOM  : true
});
```

### include

- Type: `string`
- Default: `"link[rel=stylesheet],style"`

CSS selector matching `<link>` and `<style>` elements to process. The default value includes all style and link elements.

**Tip:** For the best performance, avoid unnecessary CSS processing by including only elements that need to be transformed. See [options.exclude](#exclude) for an alternate approach.

**Example**

```javascript
// Example 1: Only <style> elements
cssVars({
  // Include only <style> elements and ignore <link> elements.
  // Removes delay introduced by AJAX requests made by the
  // ponyfill to read CSS content of external stylesheets.
  // Use only when <link> elements do not contain custom properties.
  include: 'style'
});

// Example 2: Only local CSS
cssVars({
  // Include only CSS from <style> elements and <link> elements
  // with an href that does not contain "//"
  include: 'style,link[rel="stylesheet"]:not([href*="//"])'
});

// Example 3: Specify elements via data attribute
cssVars({
  // Include only CSS from <link> and <style> elements with
  // a "data-include" attribute
  // Ex: <link data-include rel="stylesheet" href="...">
  // Ex: <style data-include>...</style>
  include: '[data-include]'
});
```

### exclude

- Type: `string`
- Default: *none*

CSS selector matching `<link rel="stylesheet">` and `<style>` elements to exclude from those matched by [options.include](#include).

**Tip:** For the best performance, avoid unnecessary processing by excluding elements that do not need to be transformed. See [options.include](#include) for an alternate approach.

**Example**

```javascript
// Example 1: Only <style> elements
cssVars({
  // Exclude <link> elements
  // Removes delay introduced by AJAX requests made by the
  // ponyfill to read CSS content of external stylesheets.
  // Use only when <link> elements do not contain custom properties.
  exclude: 'link'
});

// Example 2: Exclude based on <link> href
cssVars({
  // Of the matched 'include' elements, exclude any element
  // with an href that contains "bootstrap"
  exclude: '[href*=bootstrap]'
});

// Example 3: Exclude via data attribute
cssVars({
  // Of the matched 'include' elements, exclude any element
  // with a "data-exclude" attribute
  // Ex: <link data-exclude rel="stylesheet" href="...">
  // Ex: <style data-exclude>...</style>
  include: '[data-exclude]'
});
```

### variables

- Type: `object`
- Default: `{}`

A collection of custom property name/value pairs to apply to both legacy and modern browsers as `:root`-level custom property declarations. Property names can include or omit the leading double-hyphen (`--`). Values specified will override previous values.

Legacy browsers (and modern browsers when [options.onlyLegacy](#onlylegacy) is `false`) will process these values while generating legacy-compatible CSS. Modern browsers with native support for CSS custom properties will add/update these values using the [setProperty()](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/setProperty) method when [options.updateDOM](#updatedom) is `true`.

**Note:** Although these values are applied to both modern and legacy browsers, ponyfill callbacks like (e.g. [onComplete](#oncomplete)) will only be triggered in legacy browsers (or in modern browsers when [onlyLegacy](#onlylegacy) is `false`).

**Example**

```javascript
cssVars({
  variables: {
    '--color1': 'red',  // Leading -- included
    'color2'  : 'green' // Leading -- omitted
  }
});
```

### onlyLegacy

- Type: `boolean`
- Default: `true`

Determines how the ponyfill handles modern browsers with native CSS custom property support.

When `true`, the ponyfill will only transform CSS and trigger callbacks in browsers that lack native support for CSS custom properties. When `false`, the ponyfill will transform CSS and trigger callbacks in all browsers, regardless of their support for CSS custom properties.

**Tip:** Setting this value to `false` allows for testing in modern browsers when legacy browsers are not accessible and easier debugging using developer tools available only in modern browsers.

**Example**

```javascript
cssVars({
  onlyLegacy: true // default
});

cssVars({
  // Treat all browsers as legacy
  onlyLegacy: false
});

cssVars({
  // Treat Edge 15/16 as legacy
  onlyLegacy: !(/Edge\/1[56]\./i.test(navigator.userAgent))
});
```

### preserveStatic

- Type: `boolean`
- Default: `true`

Determines if CSS declarations that do not reference a custom property will be preserved in the transformed CSS.

When `true`, CSS declarations that do not reference a custom property value will be preserved in the transformed CSS. This requires additional processing but ensures that the original cascade order is maintained after the transformed CSS is appended to the DOM. When `false`, these declarations will be omitted from the transformed CSS. This can increase performance by reducing the amount of CSS that needs to be processed, but doing so runs the risk of breaking the original cascade when the transformed CSS is appended to the DOM (see example below).

**Note:** Earlier versions of the ponyfill (1.x) required setting this option to `true` for optimal performance. With the optimizations introduced in 2.x, this is no longer necessary.

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
  color: var(--color);
}
```

JavaScript:

```javascript
cssVars({
  preserveStatic: true // default
});
```

Output when `preserveStatic:true`

```css
h1 {
  font-weight: bold;
}

p {
  margin: 20px;
  color: red;
}
```

Output when `preserveStatic:false`

```css
p {
  color: red;
}
```

**Example: Broken cascade**

CSS:

```css
:root {
  --color: red;
}

p {
  color: var(--color);
}

@media all (min-width: 800px) {
  p {
    color: blue;
  }
}
```

Output when `preserveStatic:false`

```css
p {
  color: red;
}
```

When the above CSS output is appended to the DOM, the `color: red;` declaration overrides the `@media` rule's `color: blue;` declaration. This is because the two `p` rules have the same [CSS specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity) so the last rule wins.

A workaround for this issue is force the ponyfill to include a declaration in the output by using a bogus CSS custom property with a fallback value:

```css
@media all (min-width: 800px) {
  p {
    color: var(--bogus, blue);
  }
}
```

The ponyfill will include the declaration when `preserveStatic` is `false` and resolve to its fallback value, maintaining the original cascade.

```css
p {
  color: red;
}

@media all (min-width: 800px) {
  p {
    color: blue;
  }
}
```

### preserveVars

- Type: `boolean`
- Default: `false`

Determines if CSS custom property declarations will be preserved in the transformed CSS.

When `true`, both `:root`-level custom properties and declarations that reference a custom property using a `var()` function will be preserved in the transformed CSS. When `false`, these declarations will be omitted from the transformed CSS.

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
  preserveVars: false // default
});
```

Output when `preserveVars: false`

```css
p {
  color: red;
}
```

Output when `preserveVars: true`

```css
:root {
  --color: red;
}
p {
  color: red;
  color: var(--color);
}
```

### silent

- Type: `boolean`
- Default: `false`

Determines if warning and error messages will be displayed on the console.

When `true`, messages will be displayed on the console for each warning and error encountered while processing CSS. When `false`, messages will not be displayed on the console but will still be available using the [options.onWarning](#onwarning) and [options.onSuccess](#onsuccess) callbacks.

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
> cssVars(): "fail.css" 404 (Not Found)
> cssVars(): variable "--fail" is undefined
> cssVars(): parse error: missing "}"
```

### updateDOM

- Type: `boolean`
- Default: `true`

Determines if the ponyfill will update the DOM after processing CSS custom properties.

When `true`, transformed CSS will be appended to the DOM. For legacy browsers, this is accomplished by appending a `<style>` element with transformed CSS after the `<link>` or `<style>` element that contains the source CSS. For modern browsers, [options.variables](#variabls) values will be applied as custom property changes using the native [style.setProperty()](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/setProperty) method. When `false`, the DOM will not be updated by the ponyfill in either modern or legacy browsers, but transformed CSS can be accessed with the [options.onComplete](#oncomplete) callback.

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
  <link rel="stylesheet" href="style.css" data-cssvars="src">
  <style data-cssvars="out">
    /* Transformed CSS ... */
  </style>
</head>
```

### updateURLs

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

### watch

- Type: `null`|`boolean`
- Default: `null`

Determines if a [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) will be created to watch for `<link>` and `<style>` DOM mutations.

When `true`, the ponyfill will call itself when a `<link>` or `<style>` element is added, removed, or has its `disabled` or `href` attribute modified. The ponyfill settings used by the MutationObserver will be the same as the settings used the last time `options.watch` was set to `true`. When `false`, the ponyfill will disconnect the previously created MutationObserver if it exists. When `null`, the ponyfill will make no watch-related changes.

**Note:** This feature requires native [support for MutationObserver](https://caniuse.com/#feat=mutationobserver) or a [polyfill](https://polyfill.io/v2/docs/) for legacy browsers.

**Example**

```javascript
cssVars({
  // Connect MutationObserver
  watch: true
});

cssVars({
  // Disconnect MutationObserver
  watch: false
});
```

### onBeforeSend

- Type: `function`
- Arguments:
  1. **xhr**: The XHR `object` containing details of the failed request
  1. **elm**: The source element `object` reference
  1. **url**: The source URL `string` (`<link>` href or `@import` url)

Callback before each [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) (XHR) is sent. Allows modifying the XML object by setting properties, calling methods, or adding event handlers.

**Example**

```javascript
cssVars({
  onBeforeSend(xhr, elm, url) {
    // Domain-specific XHR settings
    if (/some-domain.com/.test(url)) {
      xhr.withCredentials = true;
      xhr.setRequestHeader("foo", "1");
      xhr.setRequestHeader("bar", "2");
    }
  }
});
```

### onWarning

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

### onError

- Type: `function`
- Arguments:
  1. **message**: The error message
  1. **elm**: The source element `object` reference
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
  onError(message, elm, xhr, url) {
    console.log(message); // 1
    console.log(elm); // 2
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

### onSuccess

- Type: `function`
- Arguments:
  1. **cssText**: A `string` of CSS text from `element` and `url`
  1. **elm**: The source element `object` reference
  1. **url**: The source URL `string` (`<link>` href, `@import` url, or page url for `<style>` data)

Callback after CSS data has been collected from each element. Allows modifying the CSS data before it is added to the final output by returning any `string` value or skipping the CSS data by returning `false`, `null`, or an empty string (`""`).

**Note:** The order in which `<link>` and `@import` CSS data is "successfully" collected (thereby triggering this callback) is not guaranteed as these requests are asynchronous.

**Example**

```javascript
cssVars({
  onSuccess(cssText, elm, url) {
    // Replace all instances of "color: red" with "color: blue"
    const newCssText = cssText.replace(/color:\s*red\s;/g, 'color: blue;');

    return newCssText;
  }
});
```

### onComplete

- Type: `function`
- Arguments:
  1. **cssText**: A `string` of concatenated and transformed CSS from `<link>` and `<style>` elements
  1. **styleElms**: An `array` of `<style>` elements appended to the DOM
  1. **cssVariables**: An `object` containing CSS custom property names and values
  1. **benchmark**: A `number` representing to the ponyfill execution time in milliseconds

Callback after all CSS has been processed, legacy-compatible CSS has been generated, and (optionally) the DOM has been updated.

**Example**

```javascript
cssVars({
  onComplete(cssText, styleElms, cssVariables, benchmark) {
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

Copyright (c) John Hildenbiddle ([@jhildenbiddle](https://twitter.com/jhildenbiddle))
