# css-vars-ponyfill

[![NPM](https://img.shields.io/npm/v/css-vars-ponyfill.svg?style=flat-square)](https://www.npmjs.com/package/css-vars-ponyfill)
[![Build Status](https://img.shields.io/travis/jhildenbiddle/css-vars-ponyfill/master.svg?style=flat-square)](https://travis-ci.org/jhildenbiddle/css-vars-ponyfill)
[![Codacy](https://img.shields.io/codacy/grade/5d967da1e518489aac42d99b87088671.svg?style=flat-square)](https://www.codacy.com/app/jhildenbiddle/css-vars-ponyfill?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=jhildenbiddle/css-vars-ponyfill&amp;utm_campaign=Badge_Grade)
[![Codecov](https://img.shields.io/codecov/c/github/jhildenbiddle/css-vars-ponyfill.svg?style=flat-square)](https://codecov.io/gh/jhildenbiddle/css-vars-ponyfill)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://github.com/jhildenbiddle/css-vars-ponyfill/blob/master/LICENSE)
[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/css-vars-ponyfill/badge)](https://www.jsdelivr.com/package/npm/css-vars-ponyfill)
[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?url=https%3A%2F%2Fgithub.com%2Fjhildenbiddle%2Fcss-vars-ponyfill&hashtags=css,developers,frontend,javascript)

A [ponyfill](https://ponyfill.com/) that provides client-side support for [CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) (aka "CSS variables") in legacy and modern browsers.

- [Documentation](https://jhildenbiddle.github.io/css-vars-ponyfill)
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

| IE   | Edge | Chrome | Firefox | Safari |
| ---- | ---- | ------ | ------- | ------ |
| 9+   | 12+  | 19+    | 6+      | 6+     |

## Contact

- Create a [Github issue](https://github.com/jhildenbiddle/css-vars-ponyfill/issues) for bug reports, feature requests, or questions
- Follow [@jhildenbiddle](https://twitter.com/jhildenbiddle) for announcements
- Add a ⭐️ [star on GitHub](https://github.com/jhildenbiddle/css-vars-ponyfill) or ❤️ [tweet](https://twitter.com/intent/tweet?url=https%3A%2F%2Fgithub.com%2Fjhildenbiddle%2Fcss-vars-ponyfill&hashtags=css,developers,frontend,javascript) to support the project!

## License

This project is licensed under the MIT License. See the [MIT LICENSE](https://github.com/jhildenbiddle/css-vars-ponyfill/blob/master/LICENSE) for details.

Copyright (c) John Hildenbiddle ([@jhildenbiddle](https://twitter.com/jhildenbiddle))
