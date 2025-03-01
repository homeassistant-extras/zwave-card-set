import {
  actionHandler,
  handleClickAction,
  moreInfoAction,
  toggleAction,
} from '@common/action-handler';
import { fireEvent, type HassUpdateEvent } from '@common/fire-event';
import type { HomeAssistant, State } from '@type/homeassistant';
import {
  getHassDeviceIfZWave,
  getZWaveNonHubs,
  processDeviceEntitiesAndCheckIfController,
} from '@util/hass';
import { renderChevronToggle, renderStateDisplay } from '@util/render';
import { getEntityIconStyles } from '@util/styles';
import { CSSResult, LitElement, html, nothing, type TemplateResult } from 'lit';
import { classMap } from 'lit-html/directives/class-map.js';
import { styleMap } from 'lit-html/directives/style-map.js';
import { property, state } from 'lit/decorators.js';
import { styles } from './styles';
import type { Config, Sensor } from './types';
const equal = require('fast-deep-equal');

/**
 * Base component for Z-Wave device cards
 * Handles common functionality for displaying device status and controls
 */
export class ZWaveDeviceInfo extends LitElement {
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
   * Flag to toggle sensor statistics
   */
  @property({ type: Boolean })
  private _sensorsExpanded: boolean = false;

  /**
   * Home Assistant instance
   * Not marked as @state as it's handled differently
   */
  protected _hass!: HomeAssistant;

  override connectedCallback(): void {
    super.connectedCallback();

    // Listen for hass updates
    window.addEventListener('hass-update', this._handleHassUpdate.bind(this));
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();

    // Clean up event listener
    window.removeEventListener(
      'hass-update',
      this._handleHassUpdate.bind(this),
    );
  }

  private _handleHassUpdate(event: Event): void {
    const {
      detail: { hass },
    } = event as CustomEvent<HassUpdateEvent>;
    this.hass = hass;
  }

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

  // required for device center
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

    const device = getHassDeviceIfZWave(hass, this._config.device_id);
    if (!device) {
      return;
    }

    const sensor: Sensor = {
      name: device.name,
      manufacturer: device.manufacturer,
      model: device.model,
      entities: [],
      sensors: [],
    };

    console.log('width', this._getCardWidth());

    sensor.isController = processDeviceEntitiesAndCheckIfController(
      hass,
      this._config.device_id,
      (entity, state) => {
        switch (entity.entity_category) {
          case 'config':
            if (state.attributes?.device_class === 'firmware') {
              sensor.firmwareState = state;
            }
            break;
          case 'diagnostic':
            if (entity.translation_key === 'last_seen') {
              sensor.lastSeenState = state;
            } else if (entity.translation_key === 'node_status') {
              sensor.nodeStatusState = state;
            } else if (
              state.attributes?.device_class === 'battery' &&
              state.attributes?.state_class === 'measurement'
            ) {
              sensor.batteryState = state;
            }
            break;
          default:
            if (this._isSensorData(state)) {
              sensor.sensors.push(state);
            } else {
              sensor.entities.push(state);
            }
            break;
        }
      },
    );

    if (!equal(sensor, this._sensor)) {
      this._sensor = sensor;
    } else {
      if (this._sensor.isController) {
        // update children who are subscribed
        fireEvent(this, 'hass-update-controller', {
          hass,
        });
      }
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
   * Handler for toggling the sensors section
   */
  private _toggleSensors(e: Event) {
    this._sensorsExpanded = !this._sensorsExpanded;
  }

  /**
   * Renders the card
   * @returns {TemplateResult} The rendered HTML template
   */
  override render(): TemplateResult | typeof nothing {
    if (!this._sensor) {
      return nothing;
    }

    // for convenience, render the controller card
    if (this._sensor.isController) {
      return html` <zwave-controller
        .config=${{
          device_id: this._config.device_id,
        }}
        .hass=${this._hass}
      ></zwave-controller>`;
    }

    const hasSensors = this._sensor.sensors.length > 0;

    return html`
      <ha-card
        class="${classMap({
          expanded: this._sensorsExpanded && hasSensors,
        })}"
      >
        <div class="grid">
          <div class="firmware">
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
              : this._renderIcon(
                  this._sensor.firmwareState,
                  undefined,
                  this._config.icon || 'mdi:z-wave',
                )}
            <div
              class="firmware-info"
              @action=${handleClickAction(
                this,
                moreInfoAction(this._sensor.firmwareState!.entity_id),
              )}
              .actionHandler=${actionHandler(
                moreInfoAction(this._sensor.firmwareState!.entity_id),
              )}
            >
              <span class="title ellipsis">${this._sensor.name}</span>
              <span class="status-label ellipsis"
                >${this._sensor.model} by ${this._sensor.manufacturer}</span
              >
            </div>
          </div>

          ${renderStateDisplay(
            this,
            this._hass,
            this._sensor.lastSeenState,
            ['status-section', 'seen', 'ellipsis'],
            'status-label',
            'Last Seen',
          )}
          ${renderStateDisplay(
            this,
            this._hass,
            this._sensor.nodeStatusState,
            ['status-section', 'status', 'ellipsis'],
            'status-label',
            'Status',
          )}

          <div
            class="entities ${this._sensor.entities.length > 3 ? 'wrap' : ''}"
          >
            ${this._sensor.entities.map((entity, index) =>
              ['humidity', 'temperature'].includes(
                entity.attributes?.device_class!,
              )
                ? renderStateDisplay(
                    this,
                    this._hass,
                    entity,
                    ['entity', `e${index + 1}`],
                    'status-label',
                    entity.attributes?.friendly_name,
                  )
                : this._renderIcon(entity, `e${index + 1}`),
            )}
          </div>
        </div>

        ${hasSensors
          ? html` <div
              class="${classMap({
                'sensors-container': true,
                expanded: this._sensorsExpanded,
              })}"
            >
              <div
                class="sensors"
                style="${this._config.features?.includes(
                  'use_icons_instead_of_names',
                )
                  ? nothing
                  : styleMap({
                      display: 'flex',
                      flexDirection: 'column',
                      paddingBottom: '30px',
                    })}"
              >
                ${this._sensor.sensors.map((entity, index) => {
                  return html`
                    <div
                      class="sensor-item"
                      style="${this._config.features?.includes(
                        'use_icons_instead_of_names',
                      )
                        ? nothing
                        : styleMap({
                            justifyContent: 'space-between',
                          })}"
                    >
                      ${this._config.features?.includes(
                        'use_icons_instead_of_names',
                      )
                        ? this._renderIcon(entity, `s${index + 1}`)
                        : html`<span class="status-label" ellipsis
                            >${entity.attributes?.friendly_name}</span
                          >`}
                      ${renderStateDisplay(
                        this,
                        this._hass,
                        entity,
                        ['sensor', `s${index + 1}`],
                        'sensor-label',
                      )}
                    </div>
                  `;
                })}
              </div>
              ${this._sensorsExpanded
                ? renderChevronToggle(
                    this._sensorsExpanded,
                    (e: Event) => this._toggleSensors(e),
                    'bottom-right',
                  )
                : nothing}
            </div>`
          : nothing}
        ${hasSensors && !this._sensorsExpanded
          ? renderChevronToggle(
              this._sensorsExpanded,
              (e: Event) => this._toggleSensors(e),
              'bottom-right',
            )
          : nothing}
      </ha-card>
    `;
  }

  private _isSensorData(state: State) {
    if (
      ['measurement', 'total_increasing'].includes(
        state.attributes!.state_class,
      )
    ) {
      if (
        ['humidity', 'temperature'].includes(state.attributes!.device_class)
      ) {
        // probably a climate sensor
        return false;
      }

      // most likely one of the following
      // - electricity
      // - energy
      return true;
    }

    if (['heat'].includes(state.attributes!.device_class)) {
      // most likely one of the following
      // - overheat sensors
      return true;
    }

    if (['event'].includes(state.domain)) {
      // most likely one of the following
      // - scene controllers
      return true;
    }

    return false;
  }

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

    const params = ['switch', 'light'].includes(state.domain)
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
   * Get card width for responsive layout
   */
  private _getCardWidth(): number {
    return this.shadowRoot?.host.getBoundingClientRect().width || 500;
  }
}
