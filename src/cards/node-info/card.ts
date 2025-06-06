import { firmware } from '@/html/node-info/firmware';
import { stateIcon } from '@/html/state-icon';
import { fireEvent, type HassUpdateEvent } from '@common/fire-event';
import type { HomeAssistant, State } from '@type/homeassistant';
import { d } from '@util/debug';
import {
  getHassDeviceIfZWave,
  getZWaveNonHubs,
  processDeviceEntitiesAndCheckIfController,
} from '@util/hass';
import {
  renderChevronToggle,
  renderError,
  renderStateDisplay,
} from '@util/render';
import { CSSResult, LitElement, html, nothing, type TemplateResult } from 'lit';
import { classMap } from 'lit-html/directives/class-map.js';
import { styleMap } from 'lit-html/directives/style-map.js';
import { property, state } from 'lit/decorators.js';
import { styles } from './styles';
import type { Config, Sensor } from './types';
const equal = require('fast-deep-equal');
const debounce = require('debounce');

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
   * Flag to toggle small card layout
   */
  @property({ type: Boolean })
  private _isSmallCard: boolean = false;

  /**
   * Indicates if the card is in dark mode
   */
  @property({ type: Boolean, reflect: true })
  private isDarkMode!: boolean;

  /**
   * Keep track of any errors
   */
  @state()
  private _error?: string;

  /**
   * Home Assistant instance
   * Not marked as @state as it's handled differently
   */
  protected _hass!: HomeAssistant;

  override connectedCallback(): void {
    super.connectedCallback();

    // Listen for hass updates
    window.addEventListener('hass-update', this._handleHassUpdate.bind(this));
    window.addEventListener(
      'resize',
      debounce(this._handleResize.bind(this), 100),
    );
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

  private _handleResize(_: Event): void {
    this._isSmallCard = this._getCardWidth() < 450;
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
    d(config, 'Setting up Z-Wave device info card', config);
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
    this.isDarkMode = hass.themes.darkMode;

    if (!this._config) {
      d(this._config, 'zwave-device:  no configuration found');
      this._error = 'No configuration found';
      return;
    }

    const device = getHassDeviceIfZWave(hass, this._config.device_id);
    if (!device) {
      d(this._config, 'zwave-device:  no device found');
      this._error = 'No device found';
      return;
    }

    const sensor: Sensor = {
      name: device.name,
      manufacturer: device.manufacturer,
      model: device.model,
      entities: [],
      sensors: [],
    };

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
      d(this._config, 'zwave-device:  sensor being set');
      this._sensor = sensor;
    } else if (this._sensor.isController) {
      // update children who are subscribed
      d(this._config, 'zwave-device:  controller sensor hass update');
      fireEvent(this, 'hass-update-controller', {
        hass,
      });
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
        name: 'content',
        label: 'Content',
        type: 'expandable',
        flatten: true,
        icon: 'mdi:text-short',
        schema: [
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
        ],
      },
      {
        name: 'features',
        label: 'Features',
        type: 'expandable',
        flatten: true,
        icon: 'mdi:list-box',
        schema: [
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
                    label: 'Debug mode - do not use in production',
                    value: 'debug',
                  },
                ],
              },
            },
          },
        ],
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
    d(this._config, 'zwave-device:  render');

    if (!this._sensor) {
      d(this._config, 'zwave-device:  no sensor found');
      return renderError(
        this._error ?? `Sensor not found for ${this._config?.device_id}`,
      );
    }

    // for convenience, render the controller card
    if (this._sensor.isController) {
      d(this._config, 'zwave-device:  rendering controller card');
      return html` <zwave-controller
        .config=${{
          device_id: this._config.device_id,
        }}
        .hass=${this._hass}
      ></zwave-controller>`;
    }

    // if the card is small, we need to move the firmware and last seen states to the sensors array

    const sensors = Object.values(this._sensor.sensors);
    if (this._isSmallCard) {
      d(this._config, 'zwave-device:  small card detected');
      if (this._sensor.nodeStatusState) {
        sensors.push(this._sensor.nodeStatusState);
      }
      if (this._sensor.lastSeenState) {
        sensors.push(this._sensor.lastSeenState);
      }
    }

    const hasSensors = sensors.length > 0;

    // templates
    const firm = firmware(this, this._hass, this._config, this._sensor);
    const seen = this._isSmallCard
      ? nothing
      : renderStateDisplay(
          this,
          this._hass,
          this._sensor.lastSeenState,
          ['status-section', 'seen', 'ellipsis'],
          'status-label',
          'Last Seen',
        );
    const status = this._isSmallCard
      ? nothing
      : renderStateDisplay(
          this,
          this._hass,
          this._sensor.nodeStatusState,
          ['status-section', 'status', 'ellipsis'],
          'status-label',
          'Status',
        );

    return html`
      <ha-card
        class="${classMap({
          expanded: this._sensorsExpanded && hasSensors,
          dead: this._sensor.nodeStatusState?.state === 'dead',
        })}"
      >
        <div class="grid">
          ${firm} ${seen} ${status}

          <div
            class="entities ${this._sensor.entities.length > 3 ? 'wrap' : ''}"
          >
            ${this._sensor.entities.map((entity, index) =>
              ['humidity', 'temperature'].includes(
                entity.attributes?.device_class,
              )
                ? renderStateDisplay(
                    this,
                    this._hass,
                    entity,
                    ['entity', `e${index + 1}`],
                    'status-label',
                    entity.attributes?.friendly_name,
                  )
                : stateIcon(this, this._hass, entity, `e${index + 1}`),
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
                ${sensors.map((entity, index) => {
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
                        ? stateIcon(this, this._hass, entity, `s${index + 1}`)
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

  /**
   * Lifecycle method that triggers when the component is first updated
   */
  override firstUpdated(_: any) {
    // bounding client rect is not available until after first render
    this._handleResize(new Event('resize'));
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
   * Get card width for responsive layout
   */
  private _getCardWidth(): number {
    return this.shadowRoot?.host.getBoundingClientRect().width ?? 500;
  }
}
