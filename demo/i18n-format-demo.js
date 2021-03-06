/**
@license https://github.com/t2ym/i18n-format/blob/master/LICENSE.md
Copyright (c) 2016, Tetsuya Mori <t2y3141592@gmail.com>. All rights reserved.
*/
import '@polymer/iron-flex-layout/iron-flex-layout.js';

import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-styles/demo-pages.js';
import '../i18n-format.js';
import { Polymer, html } from '@polymer/polymer/polymer-legacy.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import '@polymer/polymer/lib/elements/dom-if.js';
Polymer({
  importMeta: import.meta,

  _template: html`
    <style>
    .text {
      font-size: 18px;
    }
    .input {
      display: inline-block;
      width: 160px;
    }
    .dropdown-menu {
      display: inline-block;
      width: 160px;
    }
    .rotate-button {
      width: 160px;
      margin: 8px;
      display: inline-block;
    }
    .parameters-panel {
      margin-top: 16px;
      padding: 16px;
      @apply(--shadow-elevation-2dp);              
    }
    .subhead {
      margin: 8px 0 0 0;
    }
    .model {
      font-family: 'Roboto Mono', 'Consolas', 'Menlo', monospace;
    }
    </style>

    <i18n-format id="text" class="text" lang="{{lang}}" data="{{rawTemplate}}">
      <json-data preprocessed><!-- {{template}} --></json-data>
      <i18n-number lang="{{lang}}" offset="{{offset}}">{{recipients.length}}</i18n-number>
      <span>{{recipients.0.gender}}</span>
      <span>{{sender.name}}</span>
      <span>{{recipients.0.name}}</span>
      <span>a gift</span>
    </i18n-format>

    <div id="parameters" class="parameters-panel">

      <paper-dropdown-menu id="lang" label="lang" class="dropdown-menu">
        <paper-listbox slot="dropdown-content" class="dropdown-content" selected="{{lang}}" attr-for-selected="name">
          <dom-repeat items="{{langList}}">
            <template>
              <paper-item name="{{item.value}}">{{item.label}}</paper-item>
            </template>
          </dom-repeat>            
        </paper-listbox>
      </paper-dropdown-menu>

      <paper-input id="offset" class="input" type="number" min="0" max="3" label="offset" auto-validate="" error-message="Expecting 0 to 3" value="{{offset}}"></paper-input>

      <paper-input id="length" class="input" type="number" min="0" max="3" label="recipients.length" auto-validate="" error-message="Expecting 0 to 3" value="{{recipientsLength}}"></paper-input>

      <paper-button id="rotate" class="rotate-button" raised="" on-tap="_rotateRecipients">Rotate Recipients</paper-button>
      <br>

      <div>
        <pre class="model">sender = {{_getStringifiedUser(sender)}}</pre>
        <pre class="model">recipients = {{_getStringifiedRecipients(recipients)}}</pre>
      <div>

    </div>

  </div></div>
`,

  is: 'i18n-format-demo',

  properties: {
    lang: {
      type: String,
      value: 'en'
    },
    rawTemplate: {
      type: Object,
      value: function () {
        return {
          '0': 'You ({3}) gave no gifts.',
          '1': {
            'male': 'You ({3}) gave him ({4}) {5}.',
            'female': 'You ({3}) gave her ({4}) {5}.',
            'other': 'You ({3}) gave them ({4}) {5}.'
          },
          'one': {
            'male': 'You ({3}) gave him ({4}) and one other person {5}.',
            'female': 'You ({3}) gave her ({4}) and one other person {5}.',
            'other': 'You ({3}) gave them ({4}) and one other person {5}.'
          },
          'other': 'You ({3}) gave them ({4}) and {1} other people gifts.'
        };
      }
    },
    template: {
      type: String,
      computed: '_getTemplateJSON(rawTemplate)'
    },
    offset: {
      type: Number,
      value: 1
    },
    rawRecipients: {
      type: Array,
      value: function () {
        return [
          { name: 'Alice', gender: 'female' },
          { name: 'Bob', gender: 'male' },
          { name: 'Yoda', gender: 'other' }
        ];
      }
    },
    recipientsLength: {
      type: Number,
      value: 2
    },
    recipientsIndex: {
      type: Number,
      value: 0
    },
    recipients: {
      type: Array
    },
    sender: {
      type: Object,
      value: function () {
        return { name: 'Joe', gender: 'male' };
      }
    },
    langList: {
      type: Array,
      value: [
        { value: '', label: '' },
        { value: 'en', label: 'en (English (US))' },
        { value: 'en-GB', label: 'en-GB (English (UK))' },
        { value: 'de', label: 'de (German)' },
        { value: 'es', label: 'es (Spanish)' },
        { value: 'fr', label: 'fr (French)' },
        { value: 'ja', label: 'ja (Japanese)' },
        { value: 'zh-Hans', label: 'zh-Hans (Simplified Chinese)' },
        { value: 'zh-Hant', label: 'zh-Hant (Traditional Chinese)' },
        { value: 'ru', label: 'ru (Russian)' }
      ]
    },
    markdown: {
      type: String,
      notify: true,
      value: '',
      observer: '_markdownChanged'
    }
  },

  observers: [
    '_update(lang,offset,recipientsLength,recipientsIndex)',
  ],

  attached: function () {
    this.isAttached = true;
    this.markdown = this._getMarkDown();
  },

  _update: function (lang, offset, recipientsLength, recipientsIndex) {
    this.recipients = this._getRecipients(this.rawRecipients, recipientsLength, recipientsIndex);
    this.markdown = this._getMarkDown();
  },

  _markdownChanged: function (markdown) {
    this.fire('markdown-changed', { markdown: markdown });
  },

  _getStringifiedRecipients: function (recipients) {
    var result;
    if (recipients.length === 0) {
      result = '[]';
    }
    else {
      result = '[ \n' + 
        recipients.map(function (item) {
          return '  ' + this._getStringifiedUser(item);
        }.bind(this)).join(',\n') + '\n]';
    }
    return result;
  },

  _getStringifiedUser: function (user) {
    return JSON.stringify(user, null, 0).replace(/{/g, '{ ').replace(/:/g, ': ').replace(/,/g, ', ').replace(/}/g, ' }');
  },

  _getMarkDown: function () {
    var stringifiedRecipients = this._getStringifiedRecipients(this.rawRecipients,this.recipientsLength);
    var markdown = this.isAttached ? '```\n\n' +
      '<i18n-format' + 
      (this.lang ? 
      ' lang="' + this.lang + '"' : '' ) +
      '>\n' + 
      '  <json-data>' +
      JSON.stringify(this.rawTemplate, null, 2).replace(/\n/g, '\n  ') +
      '</json-data>\n' +
      '  <i18n-number' + 
      (this.lang ? 
      ' lang="' + this.lang + '"' : '' ) +
      ' offset="' + this.offset + '"' +
      '>' + this.recipients.length + '</i18n-number><!-- {{recipients.length}} -->\n' +
      '  <span>' + ( this.recipients[0] ? this.recipients[0].gender : '' ) + '</span><!-- {{recipients.0.gender}} -->\n' +
      '  <span>' + this.sender.name + '</span><!-- {{sender.name}} -->\n' +
      '  <span>' + ( this.recipients[0] ? this.recipients[0].name : '' ) + '</span><!-- {{recipients.0.name}} -->\n' +
      '  <span>a gift</span>\n' +
      '</i18n-format>\n' +
      '\n```' : '';
    return markdown;
  },

  _getRecipients: function (rawRecipients, recipientsLength, recipientsIndex) {
    var recipients = [];
    if (0 <= recipientsLength && recipientsLength <= 3) {
      for (var i = 0; i < recipientsLength; i++) {
        recipients[i] = rawRecipients[(i + recipientsIndex) % rawRecipients.length];
      }
    }

    return recipients;
  },

  _getTemplateJSON: function (rawTemplate) {
    return JSON.stringify(rawTemplate,null,2);
  },

  _rotateRecipients: function () {
    this.recipientsIndex = (this.recipientsIndex + 1) % this.rawRecipients.length;
  }
});
