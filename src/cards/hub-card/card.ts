import type { Device, HomeAssistant, State } from '@type/homeassistant';
import { processDeviceEntities } from '@util/hass';
import { CSSResult, LitElement, html, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { styles } from './styles';
import type { Config, Hub } from './types';
const equal = require('fast-deep-equal');

/**
 * Zooz Hub Card
 */
export class ZoozHubCard extends LitElement {
  /**
   * Card configuration object
   */
  @state()
  private _config!: Config;

  /**
   * Hub object containing information about the Z-Wave hub
   */
  @state()
  private _hub: Hub = {} as Hub;

  /**
   * Flag to indicate if the card is expanded
   */
  @state()
  private expanded: boolean = false;

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

    const hub = {
      name: '',
      statusEntity: {} as State,
      rssiEntities: [],
      connectedDevices: [] as Device[],
      error: '',
    } as Hub;

    const devices = Object.values(hass.devices).filter((device) => {
      return device.manufacturer === 'Zooz' && device.labels.includes('hub');
    });

    if (devices.length > 1) {
      this._hub.error = 'Multiple Zooz hubs found. Please specify one.';
      return;
    } else if (devices.length === 0) {
      this._hub.error = 'No Zooz hub found.';
      return;
    }

    const hubDevice = devices[0]!;
    hub.name = hubDevice.name_by_user || hubDevice.name || 'Zooz Hub';

    processDeviceEntities(hass, hubDevice.id, ['sensor'], (entity, state) => {
      if (entity.entity_id.includes('status')) {
        hub.statusEntity = {
          state: state.state,
          entity_id: state.entity_id,
          attributes: state.attributes,
        };
      } else if (entity.entity_id.includes('rssi')) {
        hub.rssiEntities.push({
          state: state.state,
          entity_id: state.entity_id,
          attributes: state.attributes,
        });
      }
    });

    hub.connectedDevices = Object.values(hass.devices)
      .filter((device) => {
        return device.manufacturer === 'Zooz' && !device.labels.includes('hub');
      })
      .map((device) => {
        return {
          id: device.id,
          name_by_user: device.name_by_user,
          name: device.name,
        } as Device;
      });

    if (!equal(hub, this._hub)) {
      this._hub = hub;
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
  override render(): TemplateResult {
    if (!this._hub) {
      return html`<ha-card>Loading...</ha-card>`;
    }

    if (this._hub.error) {
      return html`
        <ha-card>
          <div class="card-content">${this._hub.error}</div>
        </ha-card>
      `;
    }

    return html`
      <ha-card>
        <div class="card-header">
          <div class="name">${this._hub.name}</div>
        </div>

        <div class="card-content">
          <div class="status-row">
            <div class="status-label">Hub Status:</div>
            <ha-state-icon
              .hass=${this._hass}
              .stateObj=${this._hub.statusEntity}
            ></ha-state-icon>
            <state-display
              .hass=${this._hass}
              .stateObj=${this._hub.statusEntity}
            ></state-display>
          </div>
          ${this._hub.rssiEntities.map((rssiEntity, index) => {
            const rssiValue = rssiEntity.state;
            return html`<div class="status-row">
              <div class="status-label">RSSI 1:</div>
              <div class="status-value ${this._getRssiClass(rssiValue)}">
                ${rssiValue} dBm
              </div>
            </div>`;
          })}

          <div class="devices-row" @click="${this._toggleExpanded}">
            <div class="devices-count">
              <ha-icon icon="mdi:devices"></ha-icon>
              ${this._hub.connectedDevices.length} Connected Devices
            </div>
            <ha-icon
              class="expand-icon"
              icon="${this.expanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}"
            ></ha-icon>
          </div>

          ${this.expanded
            ? html`
                <div class="devices-list">
                  ${this._hub.connectedDevices.map(
                    (device) => html`
                      <div class="device-item">
                        <ha-icon icon="mdi:z-wave"></ha-icon>
                        <a
                          href="http://homeassistant.local:8123/config/devices/device/${device.id}"
                          target="_blank"
                          >${device.name_by_user || device.name}</a
                        >
                      </div>
                    `,
                  )}
                </div>
              `
            : ''}
        </div>
      </ha-card>
    `;
  }

  _getRssiClass(rssi: string) {
    if (rssi === 'N/A') return '';

    const rssiValue = parseInt(rssi);
    if (isNaN(rssiValue)) return '';

    if (rssiValue > -60) return 'status-good';
    if (rssiValue > -80) return 'status-warning';
    return 'status-bad';
  }

  _toggleExpanded() {
    this.expanded = !this.expanded;
  }
}
