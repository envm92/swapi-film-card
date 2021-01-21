import { html, css, LitElement } from 'lit-element';
import { until } from 'lit-html/directives/until.js';
import 'swapi-provider';

export class SwapiFilmCard extends LitElement {

  static get styles() {
    return css`
      :host {
        --swapi-yellow: #fee122;
        --swapi-green: #3cbfaf;
        --swapi-blue: #211751;
        --swapi-red: #ce0f2c;
        --swapi-brown: #f4dbb3;
        --swapi-black: black;
        display: block;
        padding: 10px;
      }

      #container {
        background-color: var(--swapi-black);
        padding: 25px;
        color: var(--swapi-green);
        font: 1.3rem Inconsolata, monospace;
        text-shadow: 0 0 5px var(--swapi-brown);
        max-width: 599px;
        border-radius: 10px;
      }
      .console-table {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        text-align: right;
        font-size: 15px;
      }
    `;
  }

  static get properties() {
    return {
      data: { type: Object },
      idFilm: { type: Number, attribute: 'id-film' },
      url: { type: String },
    };
  }

  constructor() {
    super();
    this.data = null;
    this.idFilm = 0;
  }


  __loadFromProvider(resourse, idResourse) {
    const shadow = this.shadowRoot;
    const provider = document.createElement('swapi-provider');
    provider.setAttribute('resourse', resourse);
    provider.setAttribute('id-resourse', idResourse);
    shadow.appendChild(provider);
    return new Promise(res => {
      provider.addEventListener('swapi-response', resProv => {
        res(resProv.detail);
      });
      provider.addEventListener('swapi-error', () => {
        res();
      });
    });
  }

  __loadFilm() {
    if (this.idFilm <= 0) {
      return new Promise(r => r());
    }
    return this.__loadFromProvider('films', this.idFilm).then(res => {
      this.data = res;
    });
  }

  __loadData() {
    if (!this.data) {
      if (this.url) {
        this.idFilm = +this.url.split('/')[5];
      }
      return this.__loadFilm().then(() => this.__renderData());
    }
    return this.__renderData();
  }


  __render(attribute) {
    return html`
      <div><small>${attribute}</small> : </div>
      <div class="console-table">
        ${this.data[attribute].map(v => {
          const splitUrl = v.split('/');
          return html`${until(this.__loadFromProvider(splitUrl[4], splitUrl[5]).then((data) => {
            return html`<div class="item">${data.name} </div>`;
          }), html`<span>...</span>
    `)}`;
          })}
      </div>
    `;
  }

  __renderData() {
    const romanNumbers = [
      'I',
      'II',
      'III',
      'IV',
      'V',
      'VI'
    ];
    return html`
      <div id="main">
          <div><small>episode:</small> ${romanNumbers[this.data.episode_id - 1]}</div>
          <div><small>title:</small> ${this.data.title}</div>
          <div><small>director:</small> ${this.data.director}</div>
          <div><small>producer:</small> ${this.data.producer}</div>
          <div><small>release date:</small> ${this.data.release_date}</div>
          ${this.__render('characters')}
          ${this.__render('planets')}
          ${this.__render('starships')}
          ${this.__render('vehicles')}
          ${this.__render('species')}
        </div>
    `;
  }

  render() {
    return html`
      <div id="container">
      ${until(this.__loadData(), html`<span>Loading...</span>`)}
      </div>
    `;
  }
}
