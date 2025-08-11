import type { HassUpdateEvent } from '@delegates/action-handler-delegate';
import type { HomeAssistant } from '@type/homeassistant';
import type { ZWaveDevice } from '@type/zwave';
import {
  getHassDeviceIfZWave,
  getZWaveControllers,
  getZWaveNonHubs,
  processDeviceEntitiesAndCheckIfController,
} from '@util/hass';
import {
  renderChevronToggle,
  renderError,
  renderStateDisplay,
} from '@util/render';
import { CSSResult, LitElement, html, nothing, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { styles } from './styles';
import type { Config, Controller } from './types';
const equal = require('fast-deep-equal');

/**
 * Z-Wave Controller Card
 *
 * A custom card component that displays information about a Z-Wave controller/hub.
 * Shows controller status, signal strength (RSSI), and can list all connected Z-Wave devices.
 */
export class ZWaveController extends LitElement {
  /**
   * Card configuration object containing settings like device_id and title
   */
  @state()
  private _config!: Config;

  /**
   * Controller object containing detailed information about the Z-Wave hub
   * including status, connected devices, RSSI values, and potential error messages
   */
  @state()
  private _controller!: Controller;

  /**
   * Flag to indicate if the connected devices list is expanded
   */
  @state()
  private expanded: boolean = false;

  /**
   * Home Assistant instance
   * Not marked as @state as it's handled differently
   */
  private _hass!: HomeAssistant;

  /**
   * Returns the component's CSS styles
   * @returns {CSSResult} The CSS styles for this component
   */
  static override get styles(): CSSResult {
    return styles;
  }

  /**
   * Determines if the card is being rendered in preview mode
   * @returns {boolean} True if in preview mode, false otherwise
   */
  get isPreview(): boolean {
    return (
      (this as HTMLElement).parentElement?.classList.contains('preview') ||
      false
    );
  }

  /**
   * Sets up the card configuration
   * @param {Config} config - The card configuration object
   */
  setConfig(config: Config) {
    this._config = config;
  }

  /**
   * Alternative method to set configuration for compatibility with device center
   * @param {Config} config - The card configuration object
   */
  set config(config: Config) {
    this.setConfig(config);
  }

  /**
   * Updates the card's state when Home Assistant state changes
   * Processes the hub device and its entities, checks if it's a valid controller,
   * and gathers information about connected devices
   *
   * @param {HomeAssistant} hass - The Home Assistant instance
   */
  set hass(hass: HomeAssistant) {
    this._hass = hass;

    if (!this._config) {
      return;
    }

    const hub = {
      name: '',
      rssiEntities: [],
      connectedDevices: [] as ZWaveDevice[],
    } as Controller;

    const hubDevice = this._getController(hub);

    if (!hubDevice) {
      if (!equal(hub, this._controller)) {
        this._controller = hub;
      }
      return;
    }

    const isController = processDeviceEntitiesAndCheckIfController(
      hass,
      hubDevice.id,
      (entity, state) => {
        if (entity.translation_key === 'controller_status') {
          hub.statusEntity = state;
        } else if (entity.translation_key === 'current_background_rssi') {
          hub.rssiEntities.push(state);
        }
      },
    );

    if (!isController) {
      hub.error = "Doesn't seem to be a Z-Wave Controller..";
    }

    if (!hub.error) {
      hub.name = hubDevice.name ?? 'Z-Wave Hub';
      hub.connectedDevices = getZWaveNonHubs(hass);
    }

    if (!equal(hub, this._controller)) {
      this._controller = hub;
    }
  }

  /**
   * Sets up event listeners when the component is connected to the DOM
   */
  override connectedCallback(): void {
    super.connectedCallback();

    // Listen for hass updates
    window.addEventListener(
      'hass-update-controller',
      this._handleHassUpdate.bind(this),
    );
  }

  /**
   * Cleans up event listeners when the component is disconnected from the DOM
   */
  override disconnectedCallback(): void {
    super.disconnectedCallback();

    // Clean up event listener
    window.removeEventListener(
      'hass-update-controller',
      this._handleHassUpdate.bind(this),
    );
  }

  /**
   * Event handler for Home Assistant update events
   * Updates the card when Home Assistant state changes externally
   *
   * @param {Event} event - The custom event containing updated Home Assistant data
   */
  private _handleHassUpdate(event: Event): void {
    const {
      detail: { hass },
    } = event as CustomEvent<HassUpdateEvent>;
    this.hass = hass;
  }

  /**
   * Returns the configuration element for the card
   * Creates a basic editor with a schema for the available configuration options
   *
   * @returns {Element} An editor element with the configuration schema
   */
  static getConfigElement() {
    const SCHEMA = [
      {
        name: 'device_id',
        selector: {
          // potentially improvements to this selector..
          device: {
            entity: {
              device_class: 'signal_strength',
            },
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
    ];

    const editor = document.createElement('basic-editor');
    (editor as any).schema = SCHEMA;
    return editor;
  }

  /**
   * Returns a stub configuration for the card
   * Used when the card is first added to the dashboard
   *
   * @param {HomeAssistant} hass - The Home Assistant instance
   * @returns {Promise<Config>} A promise resolving to the default configuration
   */
  public static async getStubConfig(hass: HomeAssistant): Promise<Config> {
    const devices = getZWaveControllers(hass);
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
   * Renders the card
   *
   * @returns {TemplateResult | typeof nothing} The rendered HTML template or nothing if no data is available
   */
  override render(): TemplateResult | typeof nothing {
    if (!this._controller) {
      return nothing;
    }

    if (this._controller.error) {
      return renderError(this._controller.error);
    }

    if (this.isPreview) {
      this._controller.rssiEntities.splice(1);
    }

    return html`
      <ha-card>
        <div class="card-header">
          <div class="name">
            ${this._config.title ??
            this._controller.name ??
            'Z-Wave Controller'}
          </div>
          <ha-icon icon="mdi:z-wave"></ha-icon>
        </div>

        <div class="card-content">
          <div class="status-row">
            <div class="status-label">Controller Status:</div>
            <ha-state-icon
              .hass=${this._hass}
              .stateObj=${this._controller.statusEntity}
            ></ha-state-icon>
            <state-display
              .hass=${this._hass}
              .stateObj=${this._controller.statusEntity}
            ></state-display>
          </div>
          ${this._controller.rssiEntities.map((rssiEntity, index) => {
            return renderStateDisplay(
              this,
              this._hass,
              rssiEntity,
              ['status-row', this._getRssiClass(rssiEntity.state)],
              'status-label',
              `RSSI ${index}:`,
            );
          })}

          <div class="devices-row" @click="${this._toggleExpanded}">
            <div class="devices-count">
              <ha-icon icon="mdi:devices"></ha-icon>
              ${this._controller.connectedDevices.length} Connected Devices
            </div>
            ${renderChevronToggle(
              this.expanded,
              (_: Event) => {},
              'bottom-right',
            )}
          </div>

          ${this.expanded
            ? html`
                <div class="devices-list">
                  ${this._controller.connectedDevices.map(
                    (device) => html`
                      <div class="device-item">
                        <ha-icon icon="mdi:z-wave"></ha-icon>
                        <a
                          href="http://homeassistant.local:8123/config/devices/device/${device.id}"
                          target="_blank"
                          >${device.name}</a
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

  /**
   * Determines the CSS class to apply based on RSSI value
   *
   * @param {string} rssi - The RSSI value as a string
   * @returns {string} The CSS class name based on signal strength
   */
  _getRssiClass(rssi: string) {
    if (rssi === 'N/A') return '';

    const rssiValue = parseInt(rssi);
    if (isNaN(rssiValue)) return '';

    if (rssiValue > -60) return 'status-good';
    if (rssiValue > -80) return 'status-warning';
    return 'status-bad';
  }

  /**
   * Toggles the expanded state of the connected devices list
   */
  _toggleExpanded() {
    this.expanded = !this.expanded;
  }

  /**
   * Gets the Z-Wave controller device based on configuration
   * Either uses the specified device_id from config or finds the first available controller
   *
   * @param {Controller} controller - The controller object to update with error messages if needed
   * @returns {ZWaveDevice | undefined} The controller device or undefined if not found
   */
  _getController(controller: Controller): ZWaveDevice | undefined {
    if (this._config.device_id) {
      const device = getHassDeviceIfZWave(this._hass, this._config.device_id);
      if (!device) {
        controller.error = 'Invalid Z-Wave device configured.';
        return undefined;
      }

      return device;
    } else {
      const devices = getZWaveControllers(this._hass);

      if (devices?.length > 1) {
        controller.error =
          'Multiple Z-Wave controllers found. Please specify one.';
        return undefined;
      } else if (!devices || devices.length === 0) {
        controller.error = 'No Z-Wave controller found.';
        return undefined;
      }

      return devices[0]!;
    }
  }
}
