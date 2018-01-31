# css-vars-ponyfill

[![NPM](https://img.shields.io/npm/v/css-vars-ponyfill.svg?style=flat-square)](https://www.npmjs.com/package/css-vars-ponyfill)
[![Build Status](https://img.shields.io/travis/jhildenbiddle/css-vars-ponyfill.svg?style=flat-square)](https://travis-ci.org/jhildenbiddle/css-vars-ponyfill)
[![Codacy grade](https://img.shields.io/codacy/grade/5d967da1e518489aac42d99b87088671.svg?style=flat-square)](https://www.codacy.com/app/jhildenbiddle/css-vars-ponyfill?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=jhildenbiddle/css-vars-ponyfill&amp;utm_campaign=Badge_Grade)
[![Codecov](https://img.shields.io/codecov/c/github/jhildenbiddle/css-vars-ponyfill.svg?style=flat-square)](https://codecov.io/gh/jhildenbiddle/css-vars-ponyfill)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://github.com/jhildenbiddle/css-vars-ponyfill/blob/master/LICENSE)

A [ponyfill](https://github.com/sindresorhus/ponyfill) providing client-side legacy support for [CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) (aka "CSS variables") and a unified interface for modifying values in both modern and legacy browsers.

## Why?

Legacy "support" for CSS custom properties typically means using a CSS preprocessor such as [PostCSS](http://postcss.org/) or [Sass](http://sass-lang.com/) to perform a one-time transformation of custom properties to static values prior to deployment. This approach allows developers to define variables and values using the CSS custom property *syntax*, but it fails to deliver one of the primary benefits of CSS custom properties: the ability to **set values dynamically at runtime** and have the DOM update accordingly.

This ponyfill was created specifically to address this issue. There are limitations to consider (see below), but if these limitations are acceptable then this ponyfill should simplify working with custom properties when legacy support is required.

## Features

- Client-side transformation of CSS custom properties in legacy browsers
- Modify custom properties in both modern and legacy browsers
- Supports custom property fallback values
- UMD and ES6 modules available
- Lightweight (4.5k min+gzip) and dependency-free

**Limitations**

- Custom property support is limited to `:root` declarations
- The use of `var()` is limited to property values (per [W3C specificaion](https://www.w3.org/TR/css-variables/))

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
<head>
  <!-- Original CSS via link tag -->
  <link rel="stylesheet" href="style.css">
  
  <!-- Original CSS via style tag -->
  <style>
    :root {
      --color2: green;
    }
    .two {
      color: var(--color2);
    }
  </style>
</head>
```

Linked CSS:

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

The ponyfill will generate new CSS and (optionally) append a new `<style>` node to the DOM.

```html
<head>
  <!-- Original CSS via link tag -->
  <link rel="stylesheet" href="style.css">
  
  <!-- Original CSS via style tag -->
  <style>
    :root {
      --color2: green;
    }
    .two {
      color: var(--color2);
    }
  </style>

  <!-- New style tag with generated CSS -->
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
      color: blue;
      color: var(--color2);
    }
  </style>
</head>
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

CSS selector matching `<link rel="stylesheet">` and `<style>` nodes to process. The default value includes all style and link nodes.

- Type: `string`
- Default: `"link[rel=stylesheet],style"`

**Example**

```javascript
cssVars({
  // Include only <link rel="stylesheet"> nodes
  // with an href that does not contains "bootstrap"
  include: 'link[rel=stylesheet]:not([href*=bootstrap])'
});
```

### options.exclude

CSS selector matching `<link rel="stylesheet">` and `<style>` nodes to exclude from those matched by [options.include](#optionsinclude).

- Type: `string`
- Default: *none*

**Example**

```javascript
cssVars({
  // Of matched `include` nodes, exclude any node
  // with an href that contains "bootstrap"
  exclude: '[href*=bootstrap]'
});
```

### options.onlyLegacy

Determines if the ponyfill will only process CSS custom properties in browers that lack native support (i.e., legaacy browsers).

When `true`, the ponyfill will only process CSS custom properties, generate CSS, and (optionally) update the DOM in browsers that lack native support. When `false`, the ponyfill will function the same in modern and legacy browsers. 

**Tip:** Setting this value to `false` can be useful when all browsers should function identially, such as when testing the ponyfill using a modern browser.

- Type: `boolean`
- Default: `true`

**Example**

```javascript
cssVars({
  onlyLegacy: true
});
```

### options.onlyVars

Determines if CSS declarations that do not contain a custom property value should be removed from the ponyfill-generated CSS. Note that certain @at-rules like `@font-face` and `@keyframes` require all declarations to be retained if a CSS custom property is used anywhere within the ruleset due to cascade behavior.

- Type: `boolean`
- Default: `true`

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

Determines if the original CSS custom property declaration will be retained in the ponyfill-generated CSS. 

When `true`, the original custom property declarations are available in the ponyfill-generated CSS along with their static values. This allows native methods like [setProperty()](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/setProperty) and [getPropertyValue()](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/getPropertyValue) to continue working as expected in modern browsers. When `false`, only static values are available in the ponyfill-generated CSS. Due to the browser's cascade behavior, this prevents modifying property values using native methods.

- Type: `boolean`
- Default: `true`

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

Determines if warning and error messages will be displayed on the console.

When `true`, messages will be displayed on the console for each warning and error encountered while processing CSS. When `false`, messages will not be displayed on the console but will still be avaialble using the [options.onWarning](#optionsonwarning) and [options.onSuccess](#optionsonsuccess) callbacks.

- Type: `boolean`
- Default: `false`

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
CSS XHR error: "fail.css" 404 (Not Found)
CSS transform warning: variable "--fail" is undefined
CSS parse error: missing "}"
```

### options.updateDOM

Determines if the ponyfill will update the DOM after processing CSS custom properties. 

When `true`, legacy browsers will have a `<style>` node appended with ponyfill-generated CSS, while modern browsers with native custom property support will have [options.variables](#optionsvariabls) values applied using the native [style.setProperty()](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/setProperty) method. When `false`, the DOM will not be updated by the polyfill in either modern or legacy browsers, but ponyfill-generated CSS can be accessed with either the [options.onSuccess](#optionsonsuccess) or [options.onComplete](#optionsoncomplete) callback.

- Type: `boolean`
- Default: `true`

**Example**

```javascript
cssVars({
  updateDOM: true
});
```

### options.variables

A map of custom property name/value pairs. Property names can omit or include the leading double-hyphen (`--`).

When native support for CSS custom properties is available (i.e., modern browsers), the variables defined will be applied using the native [setProperty()](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/setProperty) method and no callbacks will be triggered. When native support is not available (i.e., legacy browsers), the variables will be processed while generating new CSS.

- Type: `object`
- Default: `{}`

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

Callback after all CSS has been processed and new CSS has been generated, but *before* the new CSS has (optionally) been appended to the DOM. Allows modifying the CSS data by returning any `string` value (or `false` to skip) before [options.onComplete](#optionsoncomplete) is triggered.

- Type: `function`
- Arguments:
  1. **cssText**: A `string` of CSS text from `node` and `url`

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

Callback after a CSS parsing error has occurred or an XHR request has failed.

- Type: `function`
- Arguments:
  1. **message**: The error message
  2. **node**: The source node `object` reference
  3. **xhr**: The XHR `object` containing details of the failed request
  4. **url**: The source URL `string` (`<link>` href or `@import` url)

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

Callback after each CSS parsing warning has occurred.

- Type: `function`
- Arguments:
  1. **message**: The warning message

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

Callback after all CSS has been processed, new CSS has been generated, and (optionally) the DOM has been updated.

- Type: `function`
- Arguments:
  1. **cssText**: A `string` of concatenated CSS text from all nodes in DOM order
  2. **styleNode**: An `object` reference to the appended `<style>` node

**Example**

```javascript
cssVars({
  onComplete(cssText, styleNode) {
    // ...
  }
});
```

## License

[MIT License](https://github.com/jhildenbiddle/css-vars-ponyfill/blob/master/LICENSE)
