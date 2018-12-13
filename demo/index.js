/**
@license https://github.com/t2ym/i18n-format/blob/master/LICENSE.md
Copyright (c) 2016, 2018, Tetsuya Mori <t2y3141592@gmail.com>. All rights reserved.
*/
import "@polymer/polymer/lib/elements/dom-bind.js";
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import "@polymer/iron-flex-layout/iron-flex-layout-classes.js";
import "@polymer/paper-input/paper-input.js";
import "@polymer/paper-dropdown-menu/paper-dropdown-menu.js";
import "@polymer/paper-item/paper-item.js";
import "@polymer/paper-styles/demo-pages.js";
import "@polymer/iron-demo-helpers/demo-snippet.js";
import "@polymer/iron-demo-helpers/demo-pages-shared-styles.js";
import "../i18n-format.js";
import "./i18n-format-demo.js";
{
  const $_documentContainer = document.createElement('template');
  $_documentContainer.setAttribute('style', 'display: none;');

  $_documentContainer.innerHTML = `<custom-style include="demo-pages-shared-styles">
      <style>
      .vertical-section-container {
        max-width: 768px;
      }

      @media (max-width: 640px) {

        body {
          font-size: 14px;
          margin: 0;
          padding: 4px;
          background-color: var(--paper-grey-50);
        }

        .horizontal-section {
          background-color: white;
          padding: 8px;
          margin-right: 4px;
          min-width: 200px;

          @apply(--shadow-elevation-2dp);
        }

        .vertical-section {
          background-color: white;
          padding: 8px;
          margin: 0 4px 8px 4px;

          @apply(--shadow-elevation-2dp);
        }

      }
      --demo-snippet-code {
        @apply(--paper-font-code1);
      }

      code {
        font-family: 'Roboto Mono', 'Consolas', 'Menlo', monospace;
        color: black;
      }

      .input {
        font-family: 'Roboto', sans-serif;
        font-size: 16px;
        border-width: 0px;
        outline-width: 0px;
      }

      .select {
        font-family: 'Roboto', sans-serif;
        font-size: 16px;
        outline-width: 0px;
        border-width: 0px;
        background-color: rgba(255,255,255,0.0);
      }

      option {
        position: relative;
        top: -1;
        color: black;
        outline-width: 0px;
        border-width: 0px;
      }

      .dropdown {
        --editable-dropdown-menu: {
          display: inline-block;
          margin-right: 8px;
          text-align: left;
          width: 180px;
        };
      }

      .demo-paper-dropdown-menu {
        font-family: 'Roboto', 'Noto', Helvetica, sans-serif;
        font-size: 16px;
        font-weight: 400;
        line-height: 24px;
        text-align: left;
        margin: auto;
        width: 180px;
      }

      @media (max-width: 640px) {

        body {
          font-size: 14px;
          margin: 0;
          padding: 4px;
          background-color: var(--paper-grey-50);
        }

        .horizontal-section {
          background-color: white;
          padding: 8px;
          margin-right: 4px;
          min-width: 200px;

          @apply(--shadow-elevation-2dp);
        }

        .vertical-section {
          background-color: white;
          padding: 8px;
          margin: 0 4px 8px 4px;

          @apply(--shadow-elevation-2dp);
        }

      }
      </style>
    </custom-style>`;

  document.head.appendChild($_documentContainer.content);
}
{
  const $_documentContainer = document.createElement('template');

  $_documentContainer.innerHTML = `<div class="vertical-section-container centered">

      <h1><code>&lt;i18n-format&gt;</code> Demo</h1>

      <div class="vertical-section-container">
        <h2>Simple Template</h2>
        <demo-snippet class="centered-demo">
          <template>
            <i18n-format>
              <span>{1} element is effective for UI localization with {2}.</span>
              <code>&lt;i18n-format&gt;</code>
              <b>parameters</b>
            </i18n-format>
          </template>
        </demo-snippet>

        <h2>Bound Text Values</h2>
        <demo-snippet class="centered-demo" id="bound-demo-snippet">
          <template>
            <dom-bind id="demo">
              <template>
                <i18n-format>
                  <span>{{text.example.0}}</span>
                  <code>{{text.example.1}}</code>
                  <a href="https://www.google.com/">{{text.example.2}}</a>
                </i18n-format>
              </template>
            </dom-bind>
            <!--
              // In real cases, text values are dynamically loaded from JSON
              text = {
                "example": [
                  "A {1} element can represent a sentence with {2}.",
                  "i18n-format",
                  "localizable parameters"
                ]
              }
            -->
          </template>
        </demo-snippet>

        <h2>Compound Template</h2>
        <demo-snippet id="demo-snippet" class="left-aligned-demo" _markdown="{{markdown}}">
          <template>
            <i18n-format-demo id="i18n-format-demo"></i18n-format-demo>
          </template>
        </demo-snippet>

      </div>
    </div>`;

  document.body.appendChild($_documentContainer.content);    
}
var demoSnippets = document.querySelectorAll('demo-snippet');
Array.prototype.forEach.call(demoSnippets, function (demo) {
  var script = dom(demo).queryDistributedElements('script[type="text/markdown"]')[0];

  if (!script) {
    return;
  }

  var snippet = script.innerHTML;
  var match = snippet.match(/\n([ ]*)/);
  if (match && match[1]) {
    var lines = snippet.split(/\n/);
    snippet = 
      lines.map(function (line) {
        if (line.indexOf(match[1]) === 0) {
          line = line.slice(match[1].length);               
        }
        return line;
      }).join('\n');
  }

  snippet = '```\n' + snippet + '\n```';
  snippet = snippet.replace(/=""/g, '');

  demo._markdown = snippet;
});
window.addEventListener('dom-change', function () {
  let snippet = document.getElementById('bound-demo-snippet');
  if (snippet) {
    let demo = snippet.querySelector('#demo');
    if (demo) {
      demo.text = {
        example: [
          "A {1} element can represent a sentence with {2}.",
          "i18n-format",
          "localizable parameters"
        ]
      };
    }
  }
});
var intervalId = setInterval(() => {
  var demoSnippet = document.querySelector('demo-snippet#demo-snippet');
  if (demoSnippet) {
    clearInterval(intervalId);
    demoSnippet.addEventListener('markdown-changed', function (e) {
      demoSnippet._markdown = e.detail.markdown;
    });
  }
}, 100);
