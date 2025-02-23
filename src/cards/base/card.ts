import {
  actionHandler,
  handleClickAction,
  moreInfoAction,
  toggleAction,
} from '@common/action-handler';
import type { HomeAssistant, State } from '@type/homeassistant';
import { getZoozModels, processDeviceEntities } from '@util/hass';
import { getEntityIconStyles } from '@util/styles';
import { CSSResult, LitElement, html, nothing, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { styles } from './styles';
import type { Config, DefaultConfig, Sensor } from './types';
const equal = require('fast-deep-equal');

/**
 * Base component for Zooz device cards
 * Handles common functionality for displaying device status and controls
 */
export abstract class BaseZoozCard extends LitElement {
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
   * Entity suffix for the device
   */
  static defaultConfig(): DefaultConfig {
    return {
      icon: 'mdi:home',
      entitySuffixes: [],
      model: '',
    };
  }
  defaultConfig!: DefaultConfig;

  /**
   * Returns the component's styles
   */
  static override get styles(): CSSResult {
    return styles;
  }

  constructor() {
    super();
    this.defaultConfig = (
      this.constructor as typeof BaseZoozCard
    ).defaultConfig(); // Allows subclass to define different '.info()' method.
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

    const sensor: Sensor = {
      entities: [],
    };

    processDeviceEntities(
      hass,
      this._config.device_id,
      ['switch', 'binary_sensor', 'sensor', 'update'],
      (entity, state) => {
        if (entity.entity_id.endsWith('_firmware')) {
          sensor.firmwareState = state;
        } else if (entity.entity_id.endsWith('_last_seen')) {
          sensor.lastSeenState = state;
        } else if (entity.entity_id.endsWith('_node_status')) {
          sensor.nodeStatusState = state;
        } else if (
          this.defaultConfig.entitySuffixes.some((suffix) =>
            entity.entity_id.endsWith(suffix),
          )
        ) {
          sensor.entities.push(state);
        }
      },
    );

    const device = hass.devices[this._config.device_id];
    if (device) {
      sensor.name = device.name_by_user || device.name;
    }

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
              manufacturer: 'Zooz',
              model: this.defaultConfig().model,
            },
          },
        },
        required: true,
        label: `${this.defaultConfig().model} Device`,
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

  /**
   * Returns a stub configuration for the card
   * @param {HomeAssistant} hass - The Home Assistant instance
   */
  public static async getStubConfig(hass: HomeAssistant): Promise<Config> {
    const devices = getZoozModels(hass, this.defaultConfig().model);
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

    const entity =
      domain === 'switch'
        ? toggleAction(state.entity_id)
        : moreInfoAction(state.entity_id);
    const styles = getEntityIconStyles(state);

    return html` <div
      style="${styles}"
      class="${classes}"
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

  /**
   * Renders the card
   * @returns {TemplateResult} The rendered HTML template
   */
  override render(): TemplateResult | typeof nothing {
    if (!this._sensor) {
      return nothing;
    }

    return html`
      <ha-card class="grid">
        <div class="firmware">
          ${this._renderIcon(
            this._sensor.firmwareState,
            undefined,
            this._config.icon || this.defaultConfig.icon,
          )}
          ${this._renderStateDisplay(
            this._sensor.firmwareState,
            ['firmware-info'],
            'title',
            this._sensor.name!,
          )}
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
