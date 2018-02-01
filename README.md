# css-vars-ponyfill [![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=A%20ponyfill%20that%20provides%20client-side%20support%20for%20CSS%20custom%20properties%20(%22CSS%20variables%22)&url=https%3A%2F%2Fgithub.com%2Fjhildenbiddle%2Fcss-vars-ponyfill&via=jhildenbiddle&hashtags=css,developers,frontend,javascript)

[![NPM](https://img.shields.io/npm/v/css-vars-ponyfill.svg?style=flat-square)](https://www.npmjs.com/package/css-vars-ponyfill)
[![Build Status](https://img.shields.io/travis/jhildenbiddle/css-vars-ponyfill.svg?style=flat-square)](https://travis-ci.org/jhildenbiddle/css-vars-ponyfill)
[![Codacy grade](https://img.shields.io/codacy/grade/5d967da1e518489aac42d99b87088671.svg?style=flat-square)](https://www.codacy.com/app/jhildenbiddle/css-vars-ponyfill?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=jhildenbiddle/css-vars-ponyfill&amp;utm_campaign=Badge_Grade)
[![Codecov](https://img.shields.io/codecov/c/github/jhildenbiddle/css-vars-ponyfill.svg?style=flat-square)](https://codecov.io/gh/jhildenbiddle/css-vars-ponyfill)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://github.com/jhildenbiddle/css-vars-ponyfill/blob/master/LICENSE)

A [ponyfill](https://github.com/sindresorhus/ponyfill) that provides client-side support for [CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) ("CSS variables") in legacy browsers.

## Why

Legacy "support" for CSS custom properties often means using a CSS preprocessor such as [PostCSS](http://postcss.org/) or [Sass](http://sass-lang.com/) to perform a one-time transformation of custom properties to static values prior to deployment. This approach allows developers to define variables and values using the CSS custom property *syntax*, but it fails to deliver one of the primary benefits of CSS custom properties: the ability to **set values dynamically at runtime** and have the DOM update accordingly.

This ponyfill was created specifically to address this issue. There are limitations to consider (see below), but if these limitations are acceptable then this ponyfill should simplify working with custom properties when legacy support is required.

## Features

- Client-side transformation of CSS custom properties to static values in legacy browsers
- Unified interface for modifying runtime values in modern and legacy browsers
- Persistant changes on subsequent calls in legacy browsers
- Support for custom property fallback values
- UMD and ES6 modules available
- Lightweight (less than 5k min+gzip) and dependency-free

**Limitations**

- Custom property support is limited to `:root` declarations
- The use of `var()` is limited to property values (per [W3C specification](https://www.w3.org/TR/css-variables/))

## Installation

NPM:

```shell
npm install css-vars-ponyfill
```

Git:

```shell
git clone https://github.com/jhildenbiddle/css-vars-ponyfill.git
```

CDN ([unpkg.com](https://unpkg.com/) shown, also on [jsdelivr.net](https://www.jsdelivr.com/)):

```html
<!-- ES5 in file.html (latest v1.x.x) -->
<script src="https://unpkg.com/css-vars-ponyfill@1"></script>
<script>
  cssVars({
    // options...
  });
</script>
```

```html
<!-- ES6 module in file.html (latest v1.x.x) -->
<script type="module">
  import cssVars from 'https://unpkg.com/css-vars-ponyfill@1/dist/css-vars-ponyfill.esm.min.js';
  cssVars({
    // options...
  });
</script>
```

```javascript
// ES6 module in file.js (latest v1.x.x)
import cssVars from 'https://unpkg.com/css-vars-ponyfill@1/dist/css-vars-ponyfill.esm.min.js';
cssVars({
  // options...
});
```

## Example

HTML:

```html
<link rel="stylesheet" href="style.css">
<style>
  :root {
    --color2: green;
  }
  .two {
    color: var(--color2);
  }
</style>
```

External CSS:

```css
/* style.css */
:root {
  --color1: red;
}
.two {
  color: var(--color1);
}
```

JavaScript (see [Options](#options) for details):

```javascript
// Call using default options
cssVars();
```

CSS is generated and appended to the DOM:

```css
<style id="css-vars-ponyfill">
  :root {
    --color1: red;
    --color2: green;
  }
  .one {
    color: red;
    color: var(--color1);
  }
  .two {
    color: green;
    color: var(--color2);
  }
</style>
```

To add or modify values, call `cssVars()` using [options.variables](#optionsvariables)...

```javascript
// Call using default options
cssVars({
  variables: {
    color1: 'blue',
    color2: 'purple'
  }
});
```

… and the previously generated CSS will be updated.

```css
<style id="css-vars-ponyfill">
  :root {
    --color1: blue;
    --color2: purple;
  }
  .one {
    color: blue;
    color: var(--color1);
  }
  .two {
    color: purple;
    color: var(--color2);
  }
</style>
```

## Options

**Example**

```javascript
// Default values shown
cssVars({
  include   : 'link[rel=stylesheet],style',
  exclude   : '',
  onlyLegacy: true,
  onlyVars  : true,
  preserve  : true,
  silent    : false,
  updateDOM : true,
  variables : {
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

### options.onlyLegacy

- Type: `boolean`
- Default: `true`

Determines if the ponyfill will only generate legacy-compatible CSS in browsers that lack native support (i.e., legacy browsers).

When `true`, the ponyfill will only generate legacy-compatible CSS, trigger callbacks, and (optionally) update the DOM in browsers that lack native support. When `false`, the ponyfill will treat all browsers as legacy, regardless of their support for CSS custom properties.

**Tip:** Setting this value to `false` can be useful when all browsers should function identically, such as when testing the ponyfill using a modern browser.

**Example**

```javascript
cssVars({
  onlyLegacy: true
});
```

### options.onlyVars

- Type: `boolean`
- Default: `true`

Determines if CSS rulesets and declarations without a custom property value should be removed from the ponyfill-generated CSS.

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
  onlyVars: true
});
```

Output when `onlyVars: true`

```css
:root {
  --color: red;
}
p {
  color: red;
  color: var(--color);
}
```

Output when `onlyVars: false`

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
  color: red;
  color: var(--color);
}
```

### options.preserve

- Type: `boolean`
- Default: `true`

Determines if the original CSS custom property declaration will be retained in the ponyfill-generated CSS.

When `true`, the original custom property declarations are available in the ponyfill-generated CSS along with their static values. This allows native methods like [setProperty()](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/setProperty) and [getPropertyValue()](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/getPropertyValue) to continue working as expected in modern browsers. When `false`, only static values are available in the ponyfill-generated CSS. This reduces the CSS output size, but prevents modifying property values using native methods due to the browser's cascade behavior.

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
  preserve: true
});
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

Output when `preserve: false`

```css
p {
  color: red;
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
  silent: false
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

When `true`, legacy browsers will have a `<style>` node appended with ponyfill-generated CSS and modern browsers with native support will apply [options.variables](#optionsvariabls) as custom properties using the native  [style.setProperty()](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/setProperty) method. When `false`, the DOM will not be updated by the polyfill in either modern or legacy browsers, but ponyfill-generated CSS can be accessed with either the [options.onSuccess](#optionsonsuccess) or [options.onComplete](#optionsoncomplete) callback.

**Example**

```javascript
cssVars({
  updateDOM: true
});
```

### options.variables

- Type: `object`
- Default: `{}`

A map of custom property name/value pairs. Property names can omit or include the leading double-hyphen (`—`), and values specified here will override previous values.

Legacy browsers will process these values while generating legacy-compatible CSS. Modern browsers with native custom property support will apply these values using the native [setProperty()](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/setProperty) method when [options.updateDOM](#optionsupdatedom) is `true`.

**Example**

```javascript
cssVars({
  variables: {
    // without leading '--'
    color1    : 'red',
    // with leading '--'
    '--color2': 'green'
  }
});
```

### options.onSuccess

- Type: `function`
- Arguments:
  1. **cssText**: A `string` of CSS text from `node` and `url`

Callback after all CSS has been processed and legacy-compatible CSS has been generated, but *before* the legacy CSS has been appended to the DOM (optional). Allows modifying the CSS data by returning any `string` value (or `false` to skip) before [options.onComplete](#optionsoncomplete) is triggered.

**Example**

```javascript
// Beautify CSS output (requires separate beautify lib)
cssVars({
  onSuccess(cssText, node, url) {
    const newCssText = beautify(cssText);
    return newCssText;
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

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/jhildenbiddle/css-vars-ponyfill/blob/master/LICENSE) for details.

