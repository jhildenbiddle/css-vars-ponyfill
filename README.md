# css-vars-ponyfill

[![NPM](https://img.shields.io/npm/v/css-vars-ponyfill.svg?style=flat-square)](https://www.npmjs.com/package/css-vars-ponyfill)
[![GitHub Workflow Status (master)](https://img.shields.io/github/actions/workflow/status/jhildenbiddle/css-vars-ponyfill/test.yml?branch=master&label=checks&style=flat-square)](https://github.com/jhildenbiddle/css-vars-ponyfill/actions?query=branch%3Amaster+)
[![Codacy code quality](https://img.shields.io/codacy/grade/cb3acd7af0a34f3ea2c9f330548e2055/master?style=flat-square)](https://app.codacy.com/gh/jhildenbiddle/css-vars-ponyfill/dashboard?branch=master)
[![Codacy branch coverage](https://img.shields.io/codacy/coverage/cb3acd7af0a34f3ea2c9f330548e2055/master?style=flat-square)](https://app.codacy.com/gh/jhildenbiddle/css-vars-ponyfill/dashboard?branch=master)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://github.com/jhildenbiddle/css-vars-ponyfill/blob/master/LICENSE)
[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/css-vars-ponyfill/badge)](https://www.jsdelivr.com/package/npm/css-vars-ponyfill)
[![Sponsor this project](https://img.shields.io/static/v1?style=flat-square&label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86)](https://github.com/sponsors/jhildenbiddle)

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

## Usage & Options

See the [documentation site](https://jhildenbiddle.github.io/css-vars-ponyfill) for details.

## Sponsorship

A [sponsorship](https://github.com/sponsors/jhildenbiddle) is more than just a way to show appreciation for the open-source authors and projects we rely on; it can be the spark that ignites the next big idea, the inspiration to create something new, and the motivation to share so that others may benefit.

If you benefit from this project, please consider lending your support and encouraging future efforts by [becoming a sponsor](https://github.com/sponsors/jhildenbiddle).

Thank you! 🙏🏻

## Contact & Support

- Follow 👨🏻‍💻 **@jhildenbiddle** on [Twitter](https://twitter.com/jhildenbiddle) and [GitHub](https://github.com/jhildenbiddle) for announcements
- Create a 💬 [GitHub issue](https://github.com/jhildenbiddle/css-vars-ponyfill/issues) for bug reports, feature requests, or questions
- Add a ⭐️ [star on GitHub](https://github.com/jhildenbiddle/css-vars-ponyfill) and 🐦 [tweet](https://twitter.com/intent/tweet?url=https%3A%2F%2Fgithub.com%2Fjhildenbiddle%2Fcss-vars-ponyfill&hashtags=css,developers,frontend,javascript) to promote the project
- Become a 💖 [sponsor](https://github.com/sponsors/jhildenbiddle) to support the project and future efforts

## License

This project is licensed under the MIT License. See the [MIT LICENSE](https://github.com/jhildenbiddle/css-vars-ponyfill/blob/master/LICENSE) for details.

Copyright (c) John Hildenbiddle ([@jhildenbiddle](https://twitter.com/jhildenbiddle))
