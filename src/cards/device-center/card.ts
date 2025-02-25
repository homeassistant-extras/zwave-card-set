import type { Config as BaseConfig } from '@base/types';
import type { HomeAssistant } from '@type/homeassistant';
import { getZWaveByArea } from '@util/hass';
import { CSSResult, LitElement, html, nothing, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { literal, html as staticHTML } from 'lit/static-html.js';
import { styles } from './styles';
import type { Center, Config } from './types';
const equal = require('fast-deep-equal');

const DEVICES_CARD_MAP = {
  // todo add ZEN30 test
  'ZEN04 800LR': {
    type: literal`zwave-smart-plug`,
    title: 'ZEN04 800LR Smart Plug',
  },
  ZEN16: {
    type: literal`zwave-multi-relay`,
    title: 'ZEN16 Multi Relay',
  },
  ZEN30: {
    type: literal`zwave-double-switch`,
    title: 'ZEN30 Double Switch',
  },
  ZEN32: {
    type: literal`zwave-scene-controller`,
    title: 'ZEN32 Scene Controller',
  },
  ZEN51: {
    type: literal`zwave-dry-contact-relay`,
    title: 'ZEN51 Dry Contact Relay',
  },
  ZEN52: {
    type: literal`zwave-double-relay`,
    title: 'ZEN52 Double Relay',
  },
  'ZEN55 LR': {
    type: literal`zwave-dc-signal-sensor`,
    title: 'ZEN55 LR Sensors',
  },
  ZEN71: {
    type: literal`zwave-on-off-switch`,
    title: 'ZEN71 On/Off Switch',
  },
  ZSE41: {
    type: literal`zwave-open-close-sensor`,
    title: 'ZSE41 Open Close Sensor',
  },
  ZSE43: {
    type: literal`zwave-tilt-shock-sensor`,
    title: 'ZSE43 Tilt Shock Sensor',
  },
  ZSE44: {
    type: literal`zwave-temperature-humidity-sensor`,
    title: 'ZSE44 Temperature Humidity Sensor',
  },
};

/**
 * Z-Wave Device Center Card
 */
export class ZWaveDeviceCenter extends LitElement {
  /**
   * Card configuration object
   */
  @state()
  private _config!: Config;

  /**
   * Device center state
   */
  @state()
  private _center!: Center;

  /**
   * Home Assistant instance
   * Not marked as @state as it's handled differently
   */
  private _hass!: HomeAssistant;

  /**
   * Returns the component's styles
   */
  static override get styles(): CSSResult {
    return styles;
  }

  // getters
  get isPreview(): boolean {
    return (
      (this as HTMLElement).parentElement?.classList.contains('preview') ||
      false
    );
  }

  /**
   * Sets up the card configuration
   * @param {Config} config - The card configuration
   */
  setConfig(config: Config) {
    this._config = config;
  }

  /**
   * Updates the card's state when Home Assistant state changes
   * @param {HomeAssistant} hass - The Home Assistant instance
   */
  set hass(hass: HomeAssistant) {
    this._hass = hass;

    const center: Center = {
      devices: {},
    };

    const devices = getZWaveByArea(hass, this._config.area);

    Object.keys(DEVICES_CARD_MAP).forEach((key) => {
      const models = devices.filter((device) => device.model === key);
      if (!models.length) {
        return;
      }

      center.devices![key] = models;
    });

    if (!equal(center, this._center)) {
      this._center = center;
    }
  }

  // card configuration
  static getConfigElement(): Element {
    const SCHEMA = [
      {
        name: 'area',
        selector: {
          area: {},
        },
        required: false,
        label: 'Device Area',
      },
    ];

    const editor = document.createElement('zwave-basic-editor');
    (editor as any).schema = SCHEMA;
    return editor;
  }

  /**
   * Renders the lit element card
   * @returns {TemplateResult} The rendered HTML template
   */
  override render(): TemplateResult | typeof nothing {
    if (this._config.area && !Object.keys(this._center.devices!).length) {
      return html`<span>No devices found in area ${this._config.area}</span>`;
    }

    let deviceFound = false;
    return html`<div>
      ${this._config.area
        ? nothing
        : html`<span>Z-Wave Hub</span>
            <zwave-hub-card .hass=${this._hass}></zwave-hub-card>`}
      ${Object.entries(DEVICES_CARD_MAP).map(([model, { type, title }]) => {
        const devices = this._center.devices?.[model];

        if (!devices || devices.length === 0) {
          return nothing;
        }

        // single device preview
        if (this.isPreview) {
          if (deviceFound) {
            return nothing;
          }
          devices.splice(1);
        }

        return html`
          <div class="devices">
            <span>${title}</span>
            ${devices.map((device) => {
              deviceFound = true;
              const config: BaseConfig = {
                device_id: device.id,
              };
              return staticHTML`<${type} .config=${config} .hass=${this._hass}></${type}>`;
            })}
          </div>
        `;
      })}
    </div>`;
  }
}
