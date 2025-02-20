import { fireEvent } from '@common/fire-event';
import type { HaFormSchema } from '@type/ha-form';
import type { HomeAssistant } from '@type/homeassistant';
import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import type { Config } from './types';

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

export class DcSignalSensorCardEditor extends LitElement {
  /**
   * Card configuration object
   */
  @state()
  private _config!: Config;

  /**
   * Home Assistant instance
   * Not marked as @state as it's handled differently
   */
  public hass!: HomeAssistant;

  /**
   * Renders the lit element card
   * @returns {TemplateResult} The rendered HTML template
   */
  override render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) {
      return nothing;
    }

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${SCHEMA}
        .computeLabel=${(s: HaFormSchema) => s.label}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  /**
   * Sets up the card configuration
   * @param {EditorConfig} config - The card configuration
   */
  setConfig(config: Config) {
    this._config = config;
  }

  private _valueChanged(ev: CustomEvent) {
    const config = ev.detail.value as Config;
    fireEvent(this, 'config-changed', { config });
  }
}
