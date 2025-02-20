import type { HomeAssistant } from '@type/homeassistant';
import { processDeviceEntities } from '@util/hass';
import { CSSResult, LitElement, html, nothing } from 'lit';
import { state } from 'lit/decorators.js';
import { styles } from './styles';
import type { Config, Sensor } from './types';
const equal = require('fast-deep-equal');

export class DcSignalSensorCard extends LitElement {
  /**
   * Card configuration object
   */
  @state()
  private _config!: Config;

  /**
   * Sensor information
   */
  @state()
  private _sensor!: Sensor;

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

    const sensor: Sensor = {};

    processDeviceEntities(
      hass,
      this._config.device_id,
      ['binary_sensor', 'sensor', 'update'],
      (entity, state) => {
        if (entity.entity_id.endsWith('_sensor_firmware')) {
          sensor.firmwareState = state;
        } else if (entity.entity_id.endsWith('_last_seen')) {
          sensor.lastSeenState = state;
        } else if (entity.entity_id.endsWith('_node_status')) {
          sensor.nodeStatusState = state;
        } else if (entity.entity_id.endsWith('_smoke_detected')) {
          sensor.smokeDetectedState = state;
        } else if (entity.entity_id.endsWith('_carbon_monoxide_detected')) {
          sensor.carbonMonoxideDetectedState = state;
        }
      },
    );

    if (!equal(sensor, this._sensor)) {
      this._sensor = sensor;
    }
  }

  // card configuration
  static getConfigElement() {
    return document.createElement('dc-signal-sensor-editor');
  }

  protected override render() {
    if (!this._sensor) {
      return nothing;
    }

    return html`
      <ha-card class="grid">
        <div class=" firmware">
          <div class="icon">
            <ha-state-icon
              .hass=${this._hass}
              .stateObj=${this._sensor.firmwareState}
              icon="${this._config.icon || 'mdi:fire'}"
            ></ha-state-icon>
          </div>
          <div class="firmware-info">
            <div class="title">${this._config.title || 'Smoke Sensor'}</div>
            <state-display
              .hass=${this._hass}
              .stateObj=${this._sensor.firmwareState}
            ></state-display>
          </div>
        </div>

        <div class="status-section seen">
          <span class="status-label">Last Seen</span>
          <state-display
            .hass=${this._hass}
            .stateObj=${this._sensor.lastSeenState}
          ></state-display>
        </div>

        <div class="status-section status">
          <span class="status-label">Status</span>
          <state-display
            .hass=${this._hass}
            .stateObj=${this._sensor.nodeStatusState}
          ></state-display>
        </div>

        <div class="icon smoke">
          <ha-state-icon
            .hass=${this._hass}
            .stateObj=${this._sensor.smokeDetectedState}
          ></ha-state-icon>
        </div>

        <div class="icon co">
          <ha-state-icon
            .hass=${this._hass}
            .stateObj=${this._sensor.carbonMonoxideDetectedState}
          ></ha-state-icon>
        </div>
      </ha-card>
    `;
  }
}
