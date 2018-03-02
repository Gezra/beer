/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

import { LitElement, html } from '../../node_modules/@polymer/lit-element/lit-element.js';
import { repeat } from '../../node_modules/lit-html/lib/repeat.js';
import '../../node_modules/@polymer/app-layout/app-header/app-header.js';
import '../../node_modules/@polymer/app-layout/app-scroll-effects/effects/waterfall.js';
import '../../node_modules/@polymer/app-layout/app-toolbar/app-toolbar.js';
import { scroll } from '../../node_modules/@polymer/app-layout/helpers/helpers.js';

import { connect } from '../../node_modules/pwa-helpers/connect-mixin.js';
import { installRouter } from '../../node_modules/pwa-helpers/router.js';
import { updateSEOMetadata } from '../../node_modules/pwa-helpers/seo-metadata.js';
import { installOfflineWatcher } from '../../node_modules/pwa-helpers/network.js';
import { installMediaQueryWatcher } from '../../node_modules/pwa-helpers/media-query.js';

import { store } from '../store.js';
import { pageSelector } from '../reducers/location.js';
import { currentCategorySelector } from '../reducers/categories.js';
import { metaSelector } from '../reducers/app.js';
import { updateLocation } from '../actions/location.js';
import { updateNetworkStatus } from '../actions/app.js';
import { fetchCategories } from '../actions/categories.js';

import './shop-home.js';

class ShopApp extends connect(store)(LitElement) {
  render({ categories, categoryName, lazyResourcesLoaded, modalOpened, offline, snackbarOpened, page, a11yLabel, meta, _drawerOpened, _smallScreen }) {

    // TODO: Not very efficient right now as this will get called even if meta didn't change.
    // We are working on coming up a better way to do this more efficiently.
    if (meta) {
      updateSEOMetadata({
        title: meta.title,
        description: meta.description || meta.title,
        url: document.location.href,
        image: meta.image || this.baseURI + 'images/shop-icon-128.png'
      })
    }

    return html`
    <style>

      :host {
        display: block;
        position: relative;
        padding-top: 130px;
        padding-bottom: 64px;
        min-height: 100vh;
        --app-primary-color: #202020;
        --app-secondary-color: #757575;
        --app-accent-color: #172C50;
        --paper-button-ink-color: var(--app-accent-color);
        --paper-icon-button-ink-color: var(--app-accent-color);
        --paper-spinner-color: var(--app-accent-color);
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        color: var(--app-primary-color);
      }

      app-header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1;
        background-color: rgba(255, 255, 255, 0.95);
        --app-header-shadow: {
          box-shadow: inset 0px 5px 6px -3px rgba(0, 0, 0, 0.2);
          height: 10px;
          bottom: -10px;
        };
      }

      paper-icon-button {
        color: var(--app-primary-color);
      }

      .logo {
        text-align: center;
      }

      .logo a {
        font-size: 16px;
        font-weight: 600;
        letter-spacing: 0.3em;
        color: var(--app-primary-color);
        text-decoration: none;
        /* required for IE 11, so this <a> can receive pointer events */
        display: inline-block;
        pointer-events: auto;
      }

      .left-bar-item {
        width: 40px;
      }

      shop-cart-button {
        display: block;
        width: 40px;
      }

      .announcer {
        position: fixed;
        height: 0;
        overflow: hidden;
      }

      #tabContainer {
        position: relative;
        height: 66px;
      }

      shop-tabs {
        height: 100%;
      }

      shop-tab {
        margin: 0 10px;
      }

      shop-tab a {
        display: inline-block;
        outline: none;
        padding: 9px 5px;
        font-size: 13px;
        font-weight: 500;
        text-decoration: none;
        color: var(--app-primary-color);
      }

      .drawer-list {
        margin: 20px 0;
      }

      .drawer-list a {
        display: block;
        padding: 0 16px;
        line-height: 40px;
        text-decoration: none;
        color: var(--app-secondary-color);
      }

      .drawer-list a.active {
        color: black;
        font-weight: bold;
      }

      shop-cart-modal {
        z-index: 2;
      }

      app-drawer {
        z-index: 3;
      }

      main {
        max-width: 1440px;
        margin: 0 auto;
      }

      main .hidden {
        display: none;
      }

      footer {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        text-align: center;
        margin-top: 20px;
        line-height: 24px;
      }

      footer > a {
        color: var(--app-secondary-color);
        text-decoration: none;
      }

      footer > a:hover {
        text-decoration: underline;
      }

      .demo-label {
        box-sizing: border-box;
        width: 120px;
        padding: 6px;
        margin: 8px auto 0;
        background-color: var(--app-primary-color);
        color: white;
        text-transform: uppercase;
      }

      /* small screen */
      @media (max-width: 767px) {
        :host {
          padding-top: 64px;
        }
      }

    </style>

    <shop-analytics key="UA-39334307-16"></shop-analytics>

    <app-header role="navigation" id="header" effects="waterfall" condenses="" reveals="">
      <app-toolbar>
        <div class="left-bar-item">
          <paper-icon-button class="menu-btn" icon="menu"
              on-click="${_ => this._drawerOpened = true}"
              aria-label="Categories"
              hidden="${!_smallScreen || page === 'detail'}">
          </paper-icon-button>
          <a class="back-btn" href="/list/${categoryName}" tabindex="-1"
              hidden="${page !== 'detail'}">
            <paper-icon-button icon="arrow-back" aria-label="Go back"></paper-icon-button>
          </a>
        </div>
        <div class="logo" main-title=""><a href="/" aria-label="SHOP Home">SHOP</a></div>
        <shop-cart-button></shop-cart-button>
      </app-toolbar>

      <!-- Lazy-create the tabs for larger screen sizes. -->
      ${ ['home', 'list', 'detail'].indexOf(page) !== -1 && !_smallScreen && lazyResourcesLoaded ?
        html`
          <div id="tabContainer" sticky>
            <shop-tabs selectedIndex="${categories.map(c => c.name).indexOf(categoryName)}">
              ${repeat(categories, category => html`
                <shop-tab name="${category.name}">
                  <a href="/list/${category.name}">${category.title}</a>
                </shop-tab>
              `)}
            </shop-tabs>
          </div>
        ` : null
      }
    </app-header>

    <!-- Lazy-create the drawer for small screen sizes. -->
    ${ _smallScreen && lazyResourcesLoaded ?
      html`
        <app-drawer opened="${_drawerOpened}" tabindex="0" on-opened-changed="${e => this._drawerOpened = e.target.opened}">
          <nav class="drawer-list">
            ${repeat(categories, category => html`
              <a class$="${category.name === categoryName ? 'active' : ''}" href="/list/${category.name}">${category.title}</a>
            `)}
          </nav>
        </app-drawer>
      ` : null
    }

    <main>
      <!-- home view -->
      <shop-home class$="${page !== 'home' ? 'hidden' : ''}"></shop-home>
      <!-- list view of items in a category -->
      <shop-list class$="${page !== 'list' ? 'hidden' : ''}"></shop-list>
      <!-- detail view of one item -->
      <shop-detail class$="${page !== 'detail' ? 'hidden' : ''}"></shop-detail>
      <!-- cart view -->
      <shop-cart class$="${page !== 'cart' ? 'hidden' : ''}"></shop-cart>
      <!-- checkout view -->
      <shop-checkout class$="${page !== 'checkout' ? 'hidden' : ''}"></shop-checkout>

      <shop-404-warning class$="${page !== '404' ? 'hidden' : ''}"></shop-404-warning>
    </main>

    <footer>
      <a href="https://www.polymer-project.org/1.0/toolbox/">Made by Polymer</a>
      <div class="demo-label">Demo Only</div>
    </footer>

    <!-- a11y announcer -->
    <div class="announcer" aria-live="assertive">${a11yLabel}</div>

    ${ modalOpened ? html`<shop-cart-modal></shop-cart-modal>` : null }
    ${ lazyResourcesLoaded ? html`
      <shop-snackbar class$="${snackbarOpened ? 'opened' : ''}">
        ${offline ? 'You are offline' : 'You are online'}
      </shop-snackbar>
      ` : null
    }
    `;
  }

  static get is() { return 'shop-app'; }

  static get properties() { return {
    page: String,

    offline: Boolean,

    snackbarOpened: Boolean,

    meta: Object,

    modalOpened: Object,

    categories: Object,

    categoryName: String,

    a11yLabel: String,

    lazyResourcesLoaded: Boolean,

    _drawerOpened: Boolean,

    _smallScreen: Boolean,
  }}

  didRender(props, changed, oldProps) {
    if ('page' in changed || 'categoryName' in changed) {
      // TODO: For list view, scroll to the last saved position only if the category has not changed
      scroll({ top: 0, behavior: 'silent' });
    }
    if ('page' in changed) {
      // TODO: Remove this when app-header updated to use ResizeObserver so we can avoid this bit.
      // The size of the header depends on the page (e.g. on some pages the tabs
      // do not appear), so reset the header's layout when switching pages.
      const header = this.shadowRoot.querySelector('#header');
      header.resetLayout();
    }
  }

  ready() {
    super.ready();

    store.dispatch(fetchCategories());
    installRouter(() => this._updateLocation());
    installOfflineWatcher((offline) => store.dispatch(updateNetworkStatus(offline)));
    installMediaQueryWatcher('(max-width: 767px)', (matches) => this._smallScreen = matches);

    // Custom elements polyfill safe way to indicate an element has been upgraded.
    this.removeAttribute('unresolved');
  }

  stateChanged(state) {
    const category = currentCategorySelector(state);
    this.page = state.location.validPath ? pageSelector(state) : '404';
    this.categories = Object.values(state.categories);
    this.categoryName = category ? category.name : null;
    this.meta = metaSelector(state);
    this.modalOpened = state.app.cartModalOpened;
    this.lazyResourcesLoaded = state.location.lazyResourcesLoaded;
    this.a11yLabel = state.app.announcerLabel;
    this.offline = state.app.offline;
    this.snackbarOpened = state.app.snackbarOpened;
  }

  _updateLocation() {
    store.dispatch(updateLocation(window.decodeURIComponent(window.location.pathname)));

    // Close the drawer - in case the *route* change came from a link in the drawer.
    this._drawerOpened = false;
  }
}

customElements.define(ShopApp.is, ShopApp);