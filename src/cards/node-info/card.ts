import {
  actionHandler,
  handleClickAction,
  moreInfoAction,
  toggleAction,
} from '@common/action-handler';
import type { HomeAssistant, State } from '@type/homeassistant';
import {
  getZWaveNonHubs,
  isZWaveDevice,
  processDeviceEntitiesAndCheckIfController,
} from '@util/hass';
import { getEntityIconStyles } from '@util/styles';
import { CSSResult, LitElement, html, nothing, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { styles } from './styles';
import type { Config, Sensor } from './types';
const equal = require('fast-deep-equal');

/**
 * Base component for Z-Wave device cards
 * Handles common functionality for displaying device status and controls
 */
export class ZWaveNodeCard extends LitElement {
  /**
   * Card configuration object
   */
  @state()
  protected _config!: Config;

  /**
   * Sensor information
   */
  @state()
  protected _sensor!: Sensor;

  /**
   * Home Assistant instance
   * Not marked as @state as it's handled differently
   */
  protected _hass!: HomeAssistant;

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

  set config(config: Config) {
    this.setConfig(config);
  }

  /**
   * Updates the card's state when Home Assistant state changes
   * @param {HomeAssistant} hass - The Home Assistant instance
   */
  set hass(hass: HomeAssistant) {
    this._hass = hass;

    if (!this._config) {
      return;
    }

    const device = hass.devices[this._config.device_id];
    if (!device || !isZWaveDevice(device)) {
      return;
    }

    const sensor: Sensor = {
      entities: [],
      name: device.name_by_user || device.name,
      manufacturer: device.manufacturer,
      model: device.model,
    };

    sensor.isController = processDeviceEntitiesAndCheckIfController(
      hass,
      this._config.device_id,
      (entity, state) => {
        switch (entity.entity_category) {
          case 'config':
            if (entity.entity_id.endsWith('_firmware')) {
              sensor.firmwareState = state;
            }
            break;
          case 'diagnostic':
            if (entity.entity_id.endsWith('_last_seen')) {
              sensor.lastSeenState = state;
            } else if (entity.entity_id.endsWith('_node_status')) {
              sensor.nodeStatusState = state;
            } else if (
              entity.entity_id.startsWith('sensor.') &&
              entity.entity_id.endsWith('_battery_level')
            ) {
              sensor.batteryState = state;
            }
            break;
          case 'sensors':
            // will deal with these one day
            break;
          default:
            sensor.entities.push(state);
            break;
        }
      },
    );

    if (!equal(sensor, this._sensor)) {
      this._sensor = sensor;
    }
  }

  /**
   * Returns the configuration element for the card
   */
  static getConfigElement(): Element {
    const SCHEMA = [
      {
        name: 'device_id',
        selector: {
          device: {
            filter: {
              integration: 'zwave_js',
            },
          },
        },
        required: true,
        label: `Z Wave Devices`,
      },
      {
        name: 'title',
        required: false,
        label: 'Card Title',
        selector: {
          text: {},
        },
      },
      {
        name: 'icon',
        required: false,
        label: 'Icon',
        selector: {
          icon: {},
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
    const devices = getZWaveNonHubs(hass);
    if (!devices.length) {
      return {
        device_id: '',
      };
    }

    return {
      device_id: devices[0]!.id,
    };
  }

  /**
   * Renders a state display section
   * @param state - The state object to display
   * @param divClasses - CSS classes for the container
   * @param spanClass - CSS class for the label
   * @param title - Display title
   */
  protected _renderStateDisplay = (
    state: State | undefined,
    divClasses: string[],
    spanClass: string,
    title: string,
  ): TemplateResult | typeof nothing => {
    if (!state) {
      return nothing;
    }

    const entity = moreInfoAction(state.entity_id);

    return html`<div
      class="${divClasses.filter((c) => c !== undefined).join(' ')}"
      @action=${handleClickAction(this, entity)}
      .actionHandler=${actionHandler(entity)}
    >
      <span class="${spanClass}">${title}</span>
      <state-display .hass=${this._hass} .stateObj=${state}></state-display>
    </div>`;
  };

  /**
   * Renders an icon with state
   * @param state - The state object
   * @param className - Additional CSS class
   * @param icon - Override icon
   */
  protected _renderIcon = (
    state: State | undefined,
    className: string | undefined = undefined,
    icon: string | undefined = undefined,
  ): TemplateResult => {
    const classes = ['icon', className]
      .filter((c) => c !== undefined)
      .join(' ');
    if (!state) {
      return html`<div class="${classes}" />`;
    }

    const domain = state.entity_id.split('.')[0]!;

    const params = ['switch', 'light'].includes(domain)
      ? toggleAction(state.entity_id)
      : moreInfoAction(state.entity_id);
    const styles = getEntityIconStyles(state);

    return html` <div
      style="${styles}"
      class="${classes}"
      @action=${handleClickAction(this, params)}
      .actionHandler=${actionHandler(params)}
    >
      <ha-state-icon
        .hass=${this._hass}
        .stateObj=${state}
        .icon="${icon}"
      ></ha-state-icon>
    </div>`;
  };

  /**
   * Renders the card
   * @returns {TemplateResult} The rendered HTML template
   */
  override render(): TemplateResult | typeof nothing {
    if (!this._sensor) {
      return nothing;
    }

    if (this._sensor.isController) {
      // for convenience, show the hub card
      return html`<zwave-hub-card .hass=${this._hass}></zwave-hub-card>`;
    }
    // todo - color icon based on firmware state
    return html`
      <ha-card class="grid">
        <div class="firmware">
          ${this._renderIcon(
            this._sensor.firmwareState,
            undefined,
            this._config.icon || 'mdi:z-wave',
          )}
          <div class="firmware-info">
            <span class="title">${this._sensor.name}</span>
            <div>
              ${this._sensor.batteryState
                ? html`<battery-indicator
                    .level=${Number(this._sensor.batteryState.state)}
                    @action=${handleClickAction(
                      this,
                      moreInfoAction(this._sensor.batteryState!.entity_id),
                    )}
                    .actionHandler=${actionHandler(
                      moreInfoAction(this._sensor.batteryState!.entity_id),
                    )}
                  ></battery-indicator>`
                : nothing}
              <span class="status-label"
                >${this._sensor.model} by ${this._sensor.manufacturer}</span
              >
            </div>
          </div>
        </div>

        ${this._renderStateDisplay(
          this._sensor.lastSeenState,
          ['status-section', 'seen'],
          'status-label',
          'Last Seen',
        )}
        ${this._renderStateDisplay(
          this._sensor.nodeStatusState,
          ['status-section', 'status'],
          'status-label',
          'Status',
        )}

        <div class="entities">
          ${this._sensor.entities.map((entity, index) =>
            this._renderIcon(entity, `e${index + 1}`),
          )}
        </div>
      </ha-card>
    `;
  }
}
