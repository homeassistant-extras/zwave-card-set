import {
  actionHandler,
  handleClickAction,
  moreInfoAction,
} from '@common/action-handler';
import type { HaFormSchema } from '@type/ha-form';
import type { HomeAssistant } from '@type/homeassistant';
import { CSSResult, html, LitElement, nothing, type TemplateResult } from 'lit';
import { styleMap } from 'lit-html/directives/style-map.js';
import { state } from 'lit/decorators.js';
import { getZWaveNodes } from './helpers';
import { styles } from './styles';
import type { Config, NodeInfo } from './types';
const equal = require('fast-deep-equal');

/**
 * Z-Wave Nodes Status Card
 */
export class ZWaveNodesStatus extends LitElement {
  /**
   * Card configuration object
   */
  @state()
  private _config!: Config;

  /**
   * Dead Z-Wave nodes information
   */
  @state()
  private _deadNodes: NodeInfo[] = [];

  /**
   * Alie Z-Wave nodes information
   */
  @state()
  private _liveNodes: NodeInfo[] = [];

  /**
   * Alie Z-Wave nodes information
   */
  @state()
  private _sleepingNodes: NodeInfo[] = [];

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
   * Determines if the card is being displayed in preview mode
   * Used to limit the number of nodes shown in the UI editor
   * @returns {boolean} True if the card is in preview mode
   */
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

    // Separate dead nodes and live nodes
    const { deadNodes, liveNodes, sleepingNodes } = getZWaveNodes(hass);

    if (!equal(deadNodes, this._deadNodes)) {
      this._deadNodes = deadNodes;
    }
    if (!equal(liveNodes, this._liveNodes)) {
      this._liveNodes = liveNodes;
    }
    if (!equal(sleepingNodes, this._sleepingNodes)) {
      this._sleepingNodes = sleepingNodes;
    }
  }

  // card configuration
  static getConfigElement() {
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

    const editor = document.createElement('basic-editor');
    (editor as any).schema = SCHEMA;
    return editor;
  }

  /**
   * Renders the lit element card
   * @returns {TemplateResult} The rendered HTML template
   */
  override render(): TemplateResult {
    if (this.isPreview) {
      this._deadNodes.splice(1);
      this._liveNodes.splice(1);
      this._sleepingNodes.splice(1);
    }

    return html`
      <ha-card>
        <div class="card-header">
          ${this._config.title || 'Z-Wave Nodes Status'}
          <ha-icon icon="mdi:z-wave"></ha-icon>
        </div>
        <div
          class="card-content"
          style="${styleMap({
            '--columns': this._config.columns,
          })}"
        >
          ${this._deadNodes.length === 0 &&
          this._liveNodes.length === 0 &&
          this._sleepingNodes.length === 0
            ? html`<div class="not-found">No Z-Wave devices found</div>`
            : html`
                ${this._deadNodes.length > 0
                  ? html`
                      <div class="section-header">Dead Nodes</div>
                      <div class="nodes-grid">
                        ${this._deadNodes.map((node) => this._renderNode(node))}
                      </div>
                    `
                  : nothing}
                ${this._liveNodes.length > 0
                  ? html`
                      <div class="section-header">Active Nodes</div>
                      <div class="nodes-grid">
                        ${this._liveNodes.map((node) => this._renderNode(node))}
                      </div>
                    `
                  : nothing}
                ${this._sleepingNodes.length > 0
                  ? html`
                      <div class="section-header">Sleeping Nodes</div>
                      <div class="nodes-grid">
                        ${this._sleepingNodes.map((node) =>
                          this._renderNode(node),
                        )}
                      </div>
                    `
                  : nothing}
              `}
        </div>
      </ha-card>
    `;
  }

  _getStatusColor(status: string): string {
    switch (status) {
      case 'alive':
        return 'rgb(var(--rgb-green))';
      case 'asleep':
        return 'rgb(var(--rgb-amber))';
      case 'dead':
        return 'rgb(var(--rgb-red))';
      default:
        return 'rgb(var(--rgb-grey))';
    }
  }

  _getLastSeenColor(lastSeen: number): string {
    try {
      const now = new Date();
      const diffHours = (now.getTime() - lastSeen) / (1000 * 60 * 60);

      if (diffHours < 2) {
        return 'rgb(var(--rgb-green))';
      } else if (diffHours < 24) {
        return 'rgb(var(--rgb-amber))';
      } else {
        return 'rgb(var(--rgb-red))';
      }
    } catch (e) {
      return 'rgb(var(--rgb-grey))';
    }
  }

  _renderNode(node: NodeInfo): TemplateResult {
    const isCompact = this._config.features?.includes('compact');
    const entity = moreInfoAction(node.statusState?.entity_id);

    return html`
      <div
        class="node-item ${isCompact ? 'compact' : ''}"
        @action=${handleClickAction(this, entity)}
        .actionHandler=${actionHandler(entity)}
      >
        <div class="node-content">
          <div
            class="node-status-container"
            style="${styleMap({
              '--state-icon': this._getStatusColor(node.statusState?.state),
              '--state-display': this._getLastSeenColor(node.lastSeen),
            })}"
          >
            ${node.statusState
              ? html`
                  <ha-state-icon
                    .hass=${this._hass}
                    .stateObj=${node.statusState}
                  ></ha-state-icon>
                `
              : nothing}
            ${isCompact
              ? html`<div class="node-name">${node.name}</div>`
              : nothing}
            ${node.lastSeenState
              ? html`
                  <state-display
                    .hass=${this._hass}
                    .stateObj=${node.lastSeenState}
                  ></state-display>
                `
              : nothing}
          </div>
          ${!isCompact
            ? html`<div class="node-name">${node.name}</div>`
            : nothing}
        </div>
      </div>
    `;
  }
}
