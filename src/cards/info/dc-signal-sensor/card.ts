import { actionHandler, handleClickAction } from '@common/action-handler';
import type { ActionConfigParams } from '@type/action';
import type { HaFormSchema } from '@type/ha-form';
import type { HomeAssistant, State } from '@type/homeassistant';
import { getZoozModels, processDeviceEntities } from '@util/hass';
import { CSSResult, LitElement, html, nothing, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { styles } from './styles';
import type { Config, Sensor } from './types';
const equal = require('fast-deep-equal');

/**
 * DC Signal Sensor Card
 */
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
    const SCHEMA: HaFormSchema[] = [
      {
        name: 'device_id',
        selector: {
          device: {
            filter: {
              manufacturer: 'Zooz',
              model: 'ZEN55 LR',
            },
          },
        },
        required: true,
        label: 'ZEN55 LR Device',
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

    const editor = document.createElement('zooz-basic-editor');
    (editor as any).schema = SCHEMA;
    return editor;
  }

  public static async getStubConfig(hass: HomeAssistant): Promise<Config> {
    const devices = getZoozModels(hass, 'ZEN55 LR');
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
   * Renders the room summary card
   * @returns {TemplateResult} The rendered HTML template
   */
  override render(): TemplateResult | typeof nothing {
    if (!this._sensor) {
      return nothing;
    }

    return html`
      <ha-card class="grid">
        <div class=" firmware">
          <div class="icon">
            ${this._renderIcon(
              this._sensor.firmwareState,
              undefined,
              this._config.icon || 'mdi:fire',
            )}
          </div>
          ${this._renderStateDisplay(
            this._sensor.firmwareState,
            ['firmware-info'],
            'title',
            this._config.title || 'Smoke Sensor',
          )}
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
        ${this._renderIcon(this._sensor.smokeDetectedState, 'smoke')}
        ${this._renderIcon(this._sensor.carbonMonoxideDetectedState, 'co')}
      </ha-card>
    `;
  }

  private _renderStateDisplay = (
    state: State | undefined,
    divClasses: string[],
    spanClass: string,
    title: string,
  ): TemplateResult | typeof nothing => {
    if (!state) {
      return nothing;
    }

    const entity: ActionConfigParams = {
      entity: state.entity_id,
      tap_action: { action: 'more-info' },
      hold_action: { action: 'more-info' },
      double_tap_action: { action: 'more-info' },
    };

    return html`<div
      class="${divClasses.filter((c) => c !== undefined).join(' ')}"
      @action=${handleClickAction(this, entity)}
      .actionHandler=${actionHandler(entity)}
    >
      <span class="${spanClass}">${title}</span>
      <state-display .hass=${this._hass} .stateObj=${state}></state-display>
    </div>`;
  };

  private _renderIcon = (
    state: State | undefined,
    className: string | undefined = undefined,
    icon: string | undefined = undefined,
  ): TemplateResult | typeof nothing => {
    if (!state) {
      return nothing;
    }

    const entity: ActionConfigParams = {
      entity: state.entity_id,
      tap_action: { action: 'more-info' },
      hold_action: { action: 'more-info' },
      double_tap_action: { action: 'more-info' },
    };
    return html` <div
      class="${['icon', className].filter((c) => c !== undefined).join(' ')}"
      @action=${handleClickAction(this, entity)}
      .actionHandler=${actionHandler(entity)}
    >
      <ha-state-icon
        .hass=${this._hass}
        .stateObj=${state}
        .icon="${icon}"
      ></ha-state-icon>
    </div>`;
  };
}
