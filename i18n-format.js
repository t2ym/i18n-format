/**
@license https://github.com/t2ym/i18n-format/blob/master/LICENSE.md
Copyright (c) 2016, Tetsuya Mori <t2y3141592@gmail.com>. All rights reserved.
*/
import { polyfill } from 'wc-putty/polyfill.js';
import { html, render } from 'lit-html/lit-html.js';
import 'i18n-number/i18n-number.js';
import plurals from 'make-plural/es6/plurals.js';

const templateCache = new Map();
const jsonCache = new Map();

/**
`<i18n-format>` renders a text string with parameters to make grammatical localization of parameterized sentences easier.
The first child element (`<span>` or `<json-data>`), followed by parameter elements, provides the template for the target text with parameters.
Its parameters can be any elements like `<span>`, `<a>`, etc. See `BehaviorsStore.I18nBehavior` (work in progress) for more details in its application.

    <i18n-format>
      <span>{1} element is helpful for UI localization with {2}.</span>
      <code>i18n-format</code>
      <b>parameters</b>
    </i18n-format>

## Simple Template Format

In a simple template format, `<i18n-format>` element has these children.

- The first child is a `<span>` text element whose text content is a template text.
- Parameter elements follow the `<span>` template text element. 

In the first `<span>` element, {1}, {2}, ..., {n} represent the 1st, 2nd, ..., and n-th parameters, respectively.

    <p>
      <i18n-format>
        <span>A {1} element can represent a template with {2}.</span>
        <code>i18n-format</code>
        <a href="https://www.google.com/">parameters</a>
      </i18n-format>
    </p>

So the above example renders the following `<p>` paragraph.

    <p>A <code>i18n-format</code> element can represent a template with <a href="https://www.google.com/">parameters</a>.</p>

### Bindings

`<i18n-format>` element is effective when the UI texts are bound to localizable variables as below.
The "`this`" object here is the containing element of the `<i18n-format>` element.

    <p>
      <i18n-format>
        <span>{{text.example.0}}</span>
        <code>{{text.example.1}}</code>
        <a href="https://www.google.com/">{{text.example.2}}</a>
      </i18n-format>
    </p>
    
    this.text.example = [
      "An {1} element can represent a template with {2}.",
      "i18n-format",
      "parameters"
    ];

### Shadow DOM representation

At runtime, `slot="n"` attributes are automatically attached to identify parameters as distributed `content` elements.

    <p>
      <i18n-format>
        #shadow-root
          An
          <slot name="1">
           element can represent a template with 
          <slot name="2">
          .

        <span>An {1} element can represent a template with {2}.</span>
        <code slot="1">i18n-format</code>
        <a href="https://www.google.com/" slot="2">parameters</a>
      </i18n-format>
    </p>

### Shady DOM representation

The same effect is achieved in Shady DOM as well. The light DOM is shaded, though.

    <p>
      <i18n-format>
        An
        <code slot="1">i18n-format</code>
        element can represent a template with 
        <a href="https://www.google.com/" slot="2">parameters</a>
        .
      </i18n-format>
    </p>

## Compound Template Format

With a compound template format, `<i18n-format>` element can select an appropriate template text 
according to parameter values to render grammatical forms in plurals, gender, etc.
A `<json-data>` element as the first child specifies a compound template in JSON.
The JSON represents structured `switch (n-th parameter) case 'category'` logics. The order of 
parameter elements is significant since the JSON is traversed from its root 
according to the parameter values in the specified order.

    <i18n-format lang="{{effectiveLang}}">
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

### Plural forms

[`<i18n-number>`](https://github.com/t2ym/i18n-number) element as a parameter specifies the plural categories for the specified locale
in the `lang` attribute. [CLDR plural rules (http://cldr.unicode.org/index/cldr-spec/plural-rules)](http://cldr.unicode.org/index/cldr-spec/plural-rules) 
are supported in the plural categories.

In the above example, the value of `this.recipients.length` in the 1st parameter `<i18n-number>` 
specifies the plural category. As the '`offset`' attribute has the value of 1 in this case, '`this.recipients.length - 1`'
is effective for selecting the plural category.

### Gender forms

A `<span>` element as a parameter can select a template text according to parameter values typically for gender.
If no matching value is defined in the compound template, the category '`other`' matches.

### Parameters in the example

List of parameters and their values in the above example.

| Param #    | Value               | Shown Value for {n}        | Note            |
|:----------:|:--------------------|:---------------------------|:----------------|
| 1          | recipients.length   | recipients.length - offset |                 |
| 2          | recipients.0.gender | 'male'/'female'/'other'    | Not shown in UI |
| 3          | sender.name         | Sender's Name              |                 |
| 4          | recipients.0.name   | Recipients[0]'s Name       |                 |
| 5          | 'a gift'            | 'a gift'                   |                 |

### Selected Template Paths in the example

List of selected template paths in `<json-data>` in the above example. 
Exact numbers in plural categories are matched first and then named plural
categories such as '`one`', '`two`', '`other`' are matched for the value with the offset.

| Param 1 | {1} | Plural Category | Param 2 (gender) | Selected Template Path |
|:-------:|:---:|:---------------:|:----------------:|:-----------------------|
| 0       | -1  | 0               | -                | .0                     |
| 1       | 0   | 1               | male             | .1.male                |
| 1       | 0   | 1               | female           | .1.female              |
| 1       | 0   | 1               | other            | .1.other               |
| 2       | 1   | one             | male             | .one.male              |
| 2       | 1   | one             | female           | .one.female            |
| 2       | 1   | one             | other            | .one.other             |
| 3       | 2   | other           | male             | .other                 |
| 3       | 2   | other           | female           | .other                 |
| 3       | 2   | other           | other            | .other                 |
| 4       | 3   | other           | *                | .other                 |
| n >= 3  | n - offset | other           | *                | .other                 |

### Preprocessed Compound Template Format (generated via i18n-element/demo/gulpfile.js with useI18nFormatDataProperty = true)

In order to avoid detours in JSON.stringify() and JSON.parse() processing for <json-data> contents,
<i18n-format> element can take "data" property to set the parsed JSON data object directly and shortcut JSON stringificaton and parsing for <json-data>.
i18n-element/demo/gulpfile.js can preprocess target tagged template literals to this optimized format.
This preprocessing can be enabled by setting useI18nFormatDataProperty = true, disabled by setting useI18nFormatDataProperty = false in i18n-element/demo/gulpfile.js

- Shown in an equivalent tagged template literal format

    <i18n-format id="target" lang="${effectiveLang}" .data=${text['target']['0']}>
      <json-data preprocessed></json-data>
      <i18n-number lang="${effectiveLang}" offset="1">${this.recipients.length}</i18n-number>
      <span>${this.recipients.0.gender}</span>
      <span>${this.sender.name}</span>
      <span>${this.recipients.0.name}</span>
      <span>${text['target']['5']}</span>
    </i18n-format>

- Extracted text data

    text['target'] = [
      {
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
      },
      "{{recipients.length}}",
      "{{recipients.0.gender}}",
      "{{sender.name}}",
      "{{recipients.0.name}}",
      "a gift"
    ];

## Styling

Styles can be specified for the containing element and the contained parameters as below.

    <p class="style-for-i18n-format">
      <i18n-format>
        <span>A {1} element can represent a template with {2}.</span>
        <code class="style-for-parameter-1">i18n-format</code>
        <a class="style-for-parameter-2" href="https://www.google.com/">parameters</a>
      </i18n-format>
    </p>

@element i18n-format
@demo demo/index.html
*/
export class I18nFormat extends polyfill(HTMLElement) {
  static get is() {
    return 'i18n-format';
  }

  static get observedAttributes() {
    return [ 'lang' ];
  }

  /**
   * returns TemplateResult for _preprocessedTemplateText with lit-html
   */
  __render() {
    return html([this._preprocessedTemplateText || '']);
  }

  /**
   * Fired whenever the formatted text is rendered.
   *
   * @event rendered
   */

  /**
   * constructor for `<i18n-format>` element
   *
   * Initializes this._preprocessedTemplateText with an empty text ''
   */
  constructor() {
    super();

    /**
     * The locale for the template text.
     * The typical value is bound to `{{effectiveLang}}` when the containing element has
     * `BehaviorsStore.I18nBehavior`.
     */
    //this.lang = this.DEFAULT_LANG; // Assignment of the default value is put off until connectedCallback
    /**
     * The current preprocessed template text
     */
    this._preprocessedTemplateText = '';
  }

  /**
   * attributeChangedCallback for custom elements
   *
   * Forwards lang attribute changes to this._langChanged
   */
  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
    case 'lang':
      this._langChanged(newValue);
      break;
    /* istanbul ignore next */
    default:
      /* istanbul ignore next */
      break;
    }
  }

  /**
   * root property to imitate a Polymer element
   */
  get root() {
    return this.shadowRoot;
  }

  /**
   * Default locale constant 'en'
   */
  get DEFAULT_LANG() {
    return 'en';
  }

  /**
   * The parameter attribute name 'slot' to identify parameters.
   */
  get paramAttribute() {
    return 'slot';
  }

  /**
   * The parameter format in the template text.
   * The `'n'` in the format means n-th parameter.
   */
  get paramFormat() {
    return '{n}';
  }

  /**
   * The boolean property `observeParams` is always true
   */
  get observeParams() {
    return true;
  }
  set observeParams(value) {
    if (!this.constructor._observeParamsWarned) {
      console.warn(`${this.is}: observeParams is deprecated and has a read-only dummy value true.`);
      this.constructor._observeParamsWarned = true;
    }
  }

  /**
   * Parsed JSON data object property when the template element is `<json-data preprocessed>`
   */
  get data() {
    return this._data;
  }
  set data(value) {
    this._data = value;
    if (this._preprocessed) {
      this.render();
    }
  }

  /**
   * connectedCallback for custom elements
   *
   * Tasks:
   *  - Initializes this.lang with this.DEFAULT_LANG if not set
   *  - Sets up and observes parameters
   *  - Triggers rendering
   */
  connectedCallback() {
    if (!this.lang || this.lang.match(/^{{.*}}$/) || this.lang.match(/^\[\[.*\]\]$/)) {
      this.lang = this.DEFAULT_LANG;
    }
    if (!this.observer) {
      this._setupParams();
    }
    this.render();
  }

  /**
   * Traverses the local DOM and set up parameters and observers.
   */
  _setupParams() {
    let n;
    this.elements = Array.prototype.filter.call(
      this.childNodes,
      function (node) {
        return node.nodeType === node.ELEMENT_NODE;
      }
    );
    let needParamObservation = this.elements.length > 0 &&
                               this.elements[0].tagName.toLowerCase() === 'json-data';
    this.observer = new MutationObserver(this._templateMutated.bind(this));
    for (n = 0; n < this.elements.length; n++) {
      if (n === 0) {
        this.templateElement = this.elements[n];
        this._preprocessed = needParamObservation && this.templateElement.hasAttribute('preprocessed');
        if (!this._preprocessed) {
          let i = 0;
          do {
            this.templateTextNode = this.templateElement.childNodes[i++];
            if (!this.templateTextNode) {
              this.templateTextNode = this.templateElement.childNodes[0];
              break;
            }
          }
          while (this.templateTextNode.nodeType !== this.templateTextNode.TEXT_NODE);
          this.observer.observe(this.templateTextNode, { characterData: true });
        }
      }
      else {
        if (!this.elements[n].hasAttribute(this.paramAttribute)) {
          this.elements[n].setAttribute(this.paramAttribute, '' + n);
        }
        if (needParamObservation) {
          let firstChildNode = null;
          let childNodes = this.elements[n].childNodes;
          for (let i = 0; i < childNodes.length; i++) {
            if (childNodes[i].nodeType === childNodes[i].COMMENT_NODE) {
              continue;
            }
            firstChildNode = childNodes[i];
            break;
          }
          if (firstChildNode && firstChildNode.nodeType === firstChildNode.TEXT_NODE) {
            this.observer.observe(firstChildNode, { characterData: true });
          }
          if (this.elements[n].tagName.toLowerCase() === 'i18n-number') {
            this.elements[n].addEventListener('rendered', this.render.bind(this));
          }
        }
      }
    }
    //console.log('i18n-format: _setupParams: elements = ' + this.elements);
  }

  /**
   * MutationObserver callback of child text nodes to re-render on template text or parameter mutations.
   *
   * @param {Array} mutations Array of MutationRecord (https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver).
   */
  _templateMutated(mutations) {
    mutations.forEach(function(mutation) {
      switch (mutation.type) {
      case 'characterData':
        //console.log('i18n-format: ' + this.id + '._templateMutated(): characterData: tag = ' +
        //            mutation.target.parentNode.tagName.toLowerCase() +
        //            ' data = ' + mutation.target.data);
        if (mutation.target.parentNode.tagName.toLowerCase() !== 'i18n-number' ||
            typeof mutation.target.parentNode.formatted !== 'undefined') {
          this.render();
        }
        break;
      /* istanbul ignore next: mutation.type is always characterData */
      default:
        /* istanbul ignore next: mutation.type is always characterData */
        break;
      }
    }, this);
  }

  /**
   * Observer of `lang` property to re-render the template text.
   *
   * @param {string} lang New locale.
   */
  _langChanged(lang) {
    //console.log('i18n-format: ' + this.id + '._langChanged() lang = ' + lang + ' oldLang = ' + oldLang);
    if (this.elements &&
        lang !== undefined &&
        lang !== null &&
        !lang.match(/^{{.*}}$/) &&
        !lang.match(/^\[\[.*\]\]$/)) {
      this.render();
    }
    //else {
    //  console.log('i18n-format: skipping render()');
    //}
  }

  /**
   * Detects the CLDR plural category of a number
   * with [`make-plural` library](https://github.com/eemeli/make-plural.js).
   *
   * @param {number} n The number to get the plural category for.
   * @return {string} Plural category of the number. 
   */
  _getPluralCategory(n) {
    let category = 'other';
    let lang = this.lang || this.DEFAULT_LANG;
    lang = lang.split(/[-_]/)[0];
    if (plurals[lang]) {
      category = plurals[lang](n);
    }
    else {
      category = plurals.en(n);
    }
    //console.log('i18n-format: _getPluralCategory(' + n + ') = ' + category);
    return category;
  }

  /**
   * Selects a template text by parameters.
   *
   * @return {string} Selected template text. 
   */
  _selectTemplateText() {
    let templateText = '';
    if (!this.templateElement) {
      return templateText;
    }
    else if (this.templateElement.tagName.toLowerCase() === 'json-data') {
      let templateObject;
      try {
        if (this._preprocessed) {
          if (this.data) {
            templateObject = this.data;
          }
          else {
            return templateText;
          }
        }
        else {
          let data = this.templateTextNode.data;
          templateObject = jsonCache.get(data);
          if (!templateObject) {
            templateObject = JSON.parse(data);
            jsonCache.set(data, templateObject);
          }
        }
      }
      catch (ex) {
        if (this.templateTextNode.data) {
          console.warn('i18n-format: parse error in json-data');
        }
        return templateText;
      }
      let n;
      for (n = 1;
           typeof templateObject === 'object' && n < this.elements.length;
           n++) {
        let param = this.elements[n];
        if (param.tagName.toLowerCase() === 'i18n-number') {
          // plural selector
          let category = this._getPluralCategory(param.number);
          if (typeof param.number === 'undefined' ||
              typeof param.formatted === 'undefined') {
            // i18n-number is not ready
            //console.log('i18n-format: i18n-number is not ready');
            templateObject = undefined;
          }
          else if (templateObject[param.rawNumber]) {
            templateObject = templateObject[param.rawNumber];
          }
          else if (templateObject[category]) {
            // plural category matched
            templateObject = templateObject[category];
          }
          else if (templateObject.other) {
            // other
            templateObject = templateObject.other;
          }
          else {
            // default
            templateObject = '';
            console.warn('i18n-format: cannot find a template');
          }
        }
        else {
          // string selector
          if (templateObject[param.textContent]) {
            // template found
            templateObject = templateObject[param.textContent];
          }
          else if (templateObject.other) {
            // other
            templateObject = templateObject.other;
          }
          else {
            // default
            templateObject = '';
            console.warn('i18n-format: cannot find a template');
          }
        }
      }
      if (typeof templateObject === 'string') {
        templateText = templateObject;
      }
      else if (typeof templateObject === 'undefined') {
        templateText = undefined;
      }
      else {
        templateText = '';
        console.warn('i18n-format: cannot find a template');
      }
    }
    else {
      templateText = this.templateTextNode.data;
    }
    return templateText;
  }

  /**
   * Renders shadowRoot
   */
  invalidate() {
    if (!this.needsRender) {
      this.needsRender = true;
      Promise.resolve().then(() => {
        this.needsRender = false;
        if (!this.shadowRoot) {
          this.attachShadow({ mode: 'open' });
        }
        render(this.__render(), this.shadowRoot);
        this.dispatchEvent(new Event('rendered', { bubbles: true, cancelable: false, composed: true }));
      });
    }
  }

  /**
   * Renders the template text
   */
  render() {
    let templateText = this._selectTemplateText();
    let paramPlaceholder;
    let i;

    if (templateText === this.lastTemplateText) {
      //console.log('i18n-format: skipping rendering as the templateText has not changed');
      return;
    }
    else if (typeof templateText === 'undefined') {
      return;
    }

    this.lastTemplateText = templateText;
    //console.log('i18n-format: ' + this.id + '.render() templateText = ' + templateText);

    templateText = templateCache.get(this.lastTemplateText);
    if (typeof templateText === 'undefined') {
      templateText = this.lastTemplateText.replace(/</g, '&lt;');
      i = 1;
      while (this.elements && i < this.elements.length) {
        paramPlaceholder = this.paramFormat.replace('n', i);
        templateText = templateText.replace(paramPlaceholder, '<slot name="' + i + '"></slot>');
        i++;
      }
      templateCache.set(this.lastTemplateText, templateText);
    }

    this._preprocessedTemplateText = templateText;
    this.invalidate();
  }
}
customElements.define(I18nFormat.is, I18nFormat);

/*

Simple Template Format:

  Raw HTML:
    <p id="simpleChartDesc">A simple <code>google-chart</code> with <a href="link">google-advanced-chart</a> looks like <a href="link2">this</a>:</p>

  Light DOM when rendered:
    <p id="simpleChartDesc">
      <i18n-format>
        <span>A simple {1} with {2} looks like {3}:</span>
        <code slot="1">google-chart</code>
        <a slot="2" href="link">google-advanced-chart</a>
        <a slot="3" href="link2">this</a>
      </i18n-format>
    </p>

  Externalized HTML by i18n-behavior: 
    <p id="simpleChartDesc">
      <i18n-format>
        <span>{{text.simpleChartDesc.0}}</span>
        <code slot="1">{{text.simpleChartDesc.1}}</code>
        <a slot="2" href="link">{{text.simpleChartDesc.2}}</a>
        <a slot="3" href="link2">{{text.simpleChartDesc.3}}</a>
      </i18n-format>
    </p>

  Shadow DOM when rendered:
    <p id="simpleChartDesc">
      #shadow
        A simple <code>google-chart</code> with <a href="link">google-advanced-chart</a> looks like <a href="link2">this</a>:
      <i18n-format>
        <span>{{text.simpleChartDesc.0}}</span>
        <code slot="1">{{text.simpleChartDesc.1}}</code>
        <a slot="2" href="link">{{text.simpleChartDesc.2}}</a>
        <a slot="3" href="link2">{{text.simpleChartDesc.3}}</a>
      </i18n-format>
    </p>

  Externalized JSON
    In en:
      {
        "simpleChartDesc": [
          "A simple {1} with {2} looks like {3}:",
          "google-chart",
          "google-advanced-chart",
          "this"
        ]
      }

    In ja: (different parameter order)
      {
        "simpleChartDesc": [
          "{2} とともにシンプルな {1} を用いると、{3}ようになります:",
          "google-chart",
          "google-advanced-chart",
          "この"
        ]
      }

Compound Template Format:

  Raw HTML Template:
    <i18n-format lang="{{effectiveLang}}" text-id="sentence-with-plurals1">
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
      <i18n-number lang="{{effectiveLang}}" offset="1" options="{}">{{text.recipients.length}}</i18n-number>
      <span>{{text.recipients.0.gender}}</span>
      <span>{{text.sender.name}}</span>
      <span>{{text.recipients.0.name}}</span>
      <span>a gift</span>
    </i18n-format>

  Externalized HTML Template:

    <i18n-format lang="{{effectiveLang}}" text-id="sentence-with-plurals">
      <json-data>{{serialize(text.sentence-with-plurals.0)}}</json-data>
      <i18n-number lang="{{effectiveLang}}" offset="1" options="{}">{{text.recipients.length}}</i18n-number>
      <span>{{text.recipients.0.gender}}</span>
      <span>{{text.sender.name}}</span>
      <span>{{text.recipients.0.name}}</span>
      <span>{{text.sentence-with-plurals.5}}</span>
    </i18n-format>

  Externalized JSON:
    <template>
      <json-data text-id="sentence-with-plurals">[
        {
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
        },
        "{{text.recipients.length - 1}}",
        "{{text.recipients.0.gender}}",
        "{{text.sender.name}}",
        "{{text.recipients.0.name}}",
        "a gift"
      ]</json-data>
    </template>

*/
