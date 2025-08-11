import type { Config as NodeConfig } from '@/cards/node-info/types';
import { fireEvent } from '@hass/common/dom/fire_event';
import type { HomeAssistant } from '@type/homeassistant';
import { getZWaveByArea } from '@util/hass';
import { CSSResult, LitElement, html, nothing, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { styles } from './styles';
import type { Center, Config } from './types';
const equal = require('fast-deep-equal');

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

    devices.forEach((device) => {
      const manufacturer = device.manufacturer ?? 'unknown_manufacturer';
      const model = device.model ?? 'unknown_model';
      const name = device.device_name ?? 'unknown_name';
      const modelKey = `${model} ${name}`;

      // Initialize objects if they don't exist
      center.devices[manufacturer] ??= {};
      center.devices[manufacturer][modelKey] ??= [];

      // Add device to the appropriate manufacturer and model
      center.devices[manufacturer][modelKey].push(device);
    });

    if (!equal(center, this._center)) {
      this._center = center;
    } else {
      // update children who are subscribed
      fireEvent(this, 'hass-update', {
        hass,
      });
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
      {
        name: 'features',
        label: 'Features',
        required: false,
        selector: {
          select: {
            multiple: true,
            mode: 'list',
            options: [
              {
                label: 'Use Icons instead of Labels for Sensors',
                value: 'use_icons_instead_of_names',
              },
              {
                label: 'Show the Manufacturer and Model Headers',
                value: 'show_headers',
              },
            ],
          },
        },
      },
    ];

    const editor = document.createElement('basic-editor');
    (editor as any).schema = SCHEMA;
    return editor;
  }

  /**
   * Returns a stub configuration for the card
   * @param {HomeAssistant} hass - The Home Assistant instance
   */
  public static async getStubConfig(hass: HomeAssistant): Promise<Config> {
    return {
      features: ['show_headers'],
    };
  }

  /**
   * Renders the lit element card
   * @returns {TemplateResult} The rendered HTML template
   */
  override render(): TemplateResult | typeof nothing {
    if (this._config.area && !Object.keys(this._center.devices).length) {
      return html`<span>No devices found in area ${this._config.area}</span>`;
    }

    let deviceFound = false;

    return html`<div class="device-center">
      ${Object.entries(this._center.devices).map(([manufacturer, models]) => {
        // Skip empty manufacturers
        if (!models || Object.keys(models).length === 0) {
          return nothing;
        }

        return html`
          <div class="manufacturer">
            ${this._config.features?.includes('show_headers')
              ? html`<h1>${manufacturer}</h1>`
              : nothing}
            ${Object.entries(models).map(([modelName, devices]) => {
              // Skip empty models
              if (!devices || devices.length === 0) {
                return nothing;
              }

              // For preview mode, only show one device from the first non-empty model
              if (this.isPreview && deviceFound) {
                return nothing;
              }

              const displayDevices = this.isPreview ? [devices[0]] : devices;
              deviceFound = displayDevices.length > 0;

              return html`
                <div class="model">
                  ${this._config.features?.includes('show_headers')
                    ? html`<h2>${modelName}</h2>`
                    : nothing}
                  <div class="devices">
                    ${displayDevices.map((device) => {
                      const config: NodeConfig = {
                        device_id: device!.id,
                        features: this._config.features?.filter(
                          (f) => f !== 'show_headers',
                        ),
                      };
                      return html`<zwave-device
                        .config=${config}
                        .hass=${this._hass}
                        .showController=${true}
                      ></zwave-device>`;
                    })}
                  </div>
                </div>
              `;
            })}
          </div>
        `;
      })}
    </div>`;
  }
}
