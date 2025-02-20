import { fireEvent } from '@common/fire-event';
import type { HaFormSchema } from '@type/ha-form';
import type { HomeAssistant } from '@type/homeassistant';
import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import type { Config } from './types';

const SCHEMA: HaFormSchema[] = [
  {
    name: 'title',
    label: 'Card title.',
    required: false,
    selector: { text: {} },
  },
  {
    name: 'columns',
    label: 'Number of columns.',
    required: false,
    selector: { number: { min: 1, max: 3 } },
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
            label: 'Show the card more compact.',
            value: 'compact',
          },
        ],
      },
    },
  },
];

export class ZoozNodesStatusEditor extends LitElement {
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
    if (!config.features?.length) {
      delete config.features;
    }

    fireEvent(this, 'config-changed', { config });
  }
}
