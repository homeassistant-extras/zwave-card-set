import type { Config } from '@hub-card/types';
import type { HomeAssistant } from '@type/homeassistant';
import type { Config as DcSignalSensorConfig } from '@z55/types';
import { CSSResult, LitElement, html, nothing, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { styles } from './styles';
import type { Center } from './types';
const equal = require('fast-deep-equal');

/**
 * Zooz Device Center Card
 */
export class ZoozDeviceCenter extends LitElement {
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

    const center: Center = {};

    const devices = Object.values(hass.devices)
      .filter((device) => {
        return device.manufacturer === 'Zooz';
      })
      .map((device) => {
        return {
          id: device.id,
          model: device.model,
        };
      });

    center.zen55 = devices.filter((device) => device.model === 'ZEN55 LR');

    if (!equal(center, this._center)) {
      this._center = center;
    }
  }

  // card configuration
  static getConfigElement() {
    return document.createElement('zooz-basic-editor');
  }

  /**
   * Renders the lit element card
   * @returns {TemplateResult} The rendered HTML template
   */
  override render(): TemplateResult | typeof nothing {
    return html`<span>Zooz Hub</span>
      <zooz-hub-card .hass=${this._hass}></zooz-hub-card>

      <div class="devices">
        <span>Zooz ZEN55 LR Sensors</span>
        ${this._center.zen55?.map((device) => {
          const config: DcSignalSensorConfig = {
            device_id: device.id,
          };
          return html`<zooz-dc-signal-sensor
            .config=${config}
            .hass=${this._hass}
          ></zooz-dc-signal-sensor>`;
        })}
      </div>`;
  }
}
