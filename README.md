## `<template-text>`

Parameterized text template for localization

[Demo](https://t2ym.github.io/template-text/components/template-text/demo) and [API Docs](https://t2ym.github.io/template-text/components/template-text/)

### Install

```
    bower install --save template-text
```

### Import

```html
    <link rel="import" href="/path/to/bower_components/template-text/template-text.html">
```

### Usage

#### Simple Template

```html
    <template-text>
      <span>$1$ element is effective for UI localization with $2$.</span>
      <code>template-text</code>
      <a href="https://www.google.com/">parameters</a>
    </template-text>
```

This renders as follows:

```html
    <span><code>template-text</code> element is effective for UI localization with <a href="https://www.google.com/">parameters</a>.</span>
```

#### Compound Template

An appropriate template can be dynamically picked up according to parameter values with plural categories, gender, etc.

```html
    <p>
      <template-text lang="{{lang}}">
        <json-data>{
          "0": "You ($3$) gave no gifts.",
          "1": {
            "male": "You ($3$) gave him ($4$) $5$.",
            "female": "You ($3$) gave her ($4$) $5$.",
            "other": "You ($3$) gave them ($4$) $5$."
          },
          "one": {
            "male": "You ($3$) gave him ($4$) and one other person $5$.",
            "female": "You ($3$) gave her ($4$) and one other person $5$.",
            "other": "You ($3$) gave them ($4$) and one other person $5$."
          },
          "other": "You ($3$) gave them ($4$) and $1$ other people gifts."
        }</json-data>
        <i18n-number lang="{{effectiveLang}}" offset="1">{{recipients.length}}</i18n-number>
        <span>{{recipients.0.gender}}</span>
        <span>{{sender.name}}</span>
        <span>{{recipients.0.name}}</span>
        <span>a gift</span>
      </template-text>
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

[`<i18n-number>`](https://github.com/t2ym/i18n-number/) specifies plural categories for
[CLDR plural rules](http://cldr.unicode.org/index/cldr-spec/plural-rules).

### License

[BSD-2-Clause](https://github.com/t2ym/template-text/blob/master/LICENSE.md)
