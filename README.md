# css-vars-ponyfill

[![NPM](https://img.shields.io/npm/v/css-vars-ponyfill.svg?style=flat-square)](https://www.npmjs.com/package/css-vars-ponyfill)
[![GitHub checks](https://img.shields.io/github/checks-status/jhildenbiddle/css-vars-ponyfill/master?style=flat-square)](https://github.com/jhildenbiddle/css-vars-ponyfill/actions)
[![Codacy](https://img.shields.io/codacy/grade/cb3acd7af0a34f3ea2c9f330548e2055/master?style=flat-square)](https://app.codacy.com/gh/jhildenbiddle/css-vars-ponyfill/dashboard?branch=master)
[![Codecov](https://img.shields.io/codecov/c/github/jhildenbiddle/css-vars-ponyfill.svg?style=flat-square)](https://codecov.io/gh/jhildenbiddle/css-vars-ponyfill)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://github.com/jhildenbiddle/css-vars-ponyfill/blob/master/LICENSE)
[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/css-vars-ponyfill/badge)](https://www.jsdelivr.com/package/npm/css-vars-ponyfill)
[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?url=https%3A%2F%2Fgithub.com%2Fjhildenbiddle%2Fcss-vars-ponyfill&hashtags=css,developers,frontend,javascript)

A [ponyfill](https://ponyfill.com/) that provides client-side support for [CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) (aka "CSS variables") in legacy and modern browsers.

- [Documentation & Demos](https://jhildenbiddle.github.io/css-vars-ponyfill)

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

- Custom property declaration support is limited to `:root` and `:host` rulesets
- The use of `var()` is limited to property values (per [W3C specification](https://www.w3.org/TR/css-variables/))
- CSS changes made using [CSSOM APIs](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model) are not supported (see [#19](https://github.com/jhildenbiddle/css-vars-ponyfill/issues/19), [#23](https://github.com/jhildenbiddle/css-vars-ponyfill/issues/23), [#77](https://github.com/jhildenbiddle/css-vars-ponyfill/issues/77), [#154](https://github.com/jhildenbiddle/css-vars-ponyfill/issues/154)).

**Browser Support**

<img src="https://jhildenbiddle.github.io/css-vars-ponyfill/assets/img/chrome.svg" style="margin-right: 0.4em; vertical-align: text-bottom;"> Chrome 19+
<br>
<img src="https://jhildenbiddle.github.io/css-vars-ponyfill/assets/img/edge.svg" style="margin-right: 0.4em; vertical-align: text-bottom;"> Edge 12+
<br>
<img src="https://jhildenbiddle.github.io/css-vars-ponyfill/assets/img/firefox.svg" style="margin-right: 0.4em; vertical-align: text-bottom;"> Firefox 6+
<br>
<img src="https://jhildenbiddle.github.io/css-vars-ponyfill/assets/img/ie.svg" style="margin-right: 0.4em; vertical-align: text-bottom;"> IE 9+
<br>
<img src="https://jhildenbiddle.github.io/css-vars-ponyfill/assets/img/safari.svg" style="margin-right: 0.4em; vertical-align: text-bottom;"> Safari 6+

## Contact

- Create a [Github issue](https://github.com/jhildenbiddle/css-vars-ponyfill/issues) for bug reports, feature requests, or questions
- Follow [@jhildenbiddle](https://twitter.com/jhildenbiddle) for announcements
- Add a ⭐️ [star on GitHub](https://github.com/jhildenbiddle/css-vars-ponyfill) or ❤️ [tweet](https://twitter.com/intent/tweet?url=https%3A%2F%2Fgithub.com%2Fjhildenbiddle%2Fcss-vars-ponyfill&hashtags=css,developers,frontend,javascript) to support the project!

## License

This project is licensed under the MIT License. See the [MIT LICENSE](https://github.com/jhildenbiddle/css-vars-ponyfill/blob/master/LICENSE) for details.

Copyright (c) John Hildenbiddle ([@jhildenbiddle](https://twitter.com/jhildenbiddle))
