[![Build Status](https://travis-ci.org/t2ym/i18n-format.svg?branch=master)](https://travis-ci.org/t2ym/i18n-format)
[![Coverage Status](https://coveralls.io/repos/github/t2ym/i18n-format/badge.svg?branch=master&build=39)](https://coveralls.io/github/t2ym/i18n-format?branch=master)
[![npm version](https://badge.fury.io/js/i18n-format.svg)](https://badge.fury.io/js/i18n-format)
[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/t2ym/i18n-format)

## `<i18n-format>`

Text formatter with [Unicode CLDR plural rules](http://cldr.unicode.org/index/cldr-spec/plural-rules) and choices (like gender) support.

[Demo](https://t2ym.github.io/i18n-format/components/i18n-format/demo/) and [API Docs](https://www.webcomponents.org/element/t2ym/i18n-format/elements/i18n-format)

<img src="https://raw.githubusercontent.com/wiki/t2ym/i18n-format/i18n-format.gif" width="600px">

### Install

```
    npm install i18n-format
```

### Import

```javascript
    import "i18n-format/i18n-format.js";
```

### Usage

#### Simple Template Format

```html
    <p>
      <i18n-format>
        <span>{1} element is effective for UI localization with {2}.</span>
        <code>i18n-format</code>
        <a href="https://www.google.com/">parameters</a>
      </i18n-format>
    </p>
```

This renders as follows:

```html
    <p><code>i18n-format</code> element is effective for UI localization with <a href="https://www.google.com/">parameters</a>.</p>
```

#### Compound Template Format

An appropriate template in `json-data` is selected by plural categories, gender, etc.

```html
    <p>
      <i18n-format lang="{{lang}}">
        <json-data>{
          "0": "You ({3}) gave no gifts.",
          "1": {
            "male": "You ({3}) gave him ({4}) {5}.",
            "female": "You ({3}) gave her ({4}) {5}.",
            "other": "You ({3}) gave them ({4}) {5}."
          },
          "one": {
            "male": "You ({3}) gave him ({4}) and one other person {5}.",
            "female": "You ({3}) gave her ({4}) and one other person {5}.",
            "other": "You ({3}) gave them ({4}) and one other person {5}."
          },
          "other": "You ({3}) gave them ({4}) and {1} other people gifts."
        }</json-data>
        <i18n-number lang="{{effectiveLang}}" offset="1">{{recipients.length}}</i18n-number>
        <span>{{recipients.0.gender}}</span>
        <span>{{sender.name}}</span>
        <span>{{recipients.0.name}}</span>
        <span>a gift</span>
      </i18n-format>
    </p>
```

With these values for the parameters, the template path `.one.female` is selected from `<json-data>`.

| Parameters          | Values   |
|:--------------------|:---------|
| lang                | 'en'     |
| recipients.length   | 2        |
| recipients.0.gender | 'female' |
| sender.name         | 'James'  |
| recipients.0.name   | 'Alice'  |

So this example renders as follows:

```html
  <p>You (<span>James</span>) gave her (<span>Alice</span>) and one other person <span>a gift</span>.</p>
```

[`<i18n-number>`](https://www.webcomponents.org/element/t2ym/i18n-number) specifies plural categories for
[CLDR plural rules](http://cldr.unicode.org/index/cldr-spec/plural-rules).

### Demo

#### Prerequisite for Building and Serving Demo

```sh
    npm install -g polymer-cli
```

#### On-the-fly Build

```sh
    # Serve at http://localhost:8080/components/i18n-format/demo/
    polymer serve --npm --module-resolution=node -p 8080
```

#### Static Builds

- Build

```sh
    polymer build
```

- Targets

| target | browser | minify | bundled |
|:-----:|:-------:|:------:|:-------:|
|build/esm-unbundled|es6,modules|no|no|
|build/esm-bundled  |es6,modules|yes|yes|
|build/es6-bundled  |es6        |yes|yes|
|build/es5-bundled  |es5        |yes|yes|

- Serve

```sh
    # Serve at http://localhost:8080/
    cd build/{esm-unbundled|esm-bundled|es6-bundled|es5-bundled}
    python -m SimpleHTTPServer 8080 # or any HTTP(S) server
```

### License

[BSD-2-Clause](https://github.com/t2ym/i18n-format/blob/master/LICENSE.md)
