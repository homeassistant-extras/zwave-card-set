import type { HomeAssistant } from '@type/homeassistant';
import { CSSResult, html, LitElement, nothing, type TemplateResult } from 'lit';
import { styleMap } from 'lit-html/directives/style-map.js';
import { state } from 'lit/decorators.js';
import { styles } from './styles';
import type { Config, NodeInfo } from './types';
const equal = require('fast-deep-equal');

export class ZoozNodesStatus extends LitElement {
  /**
   * Card configuration object
   */
  @state()
  private _config!: Config;

  /**
   * Dead Zooz nodes information
   */
  @state()
  private _deadNodes: NodeInfo[] = [];

  /**
   * Alie Zooz nodes information
   */
  @state()
  private _liveNodes: NodeInfo[] = [];

  /**
   * Alie Zooz nodes information
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

    // Object to store the zooz devices
    const zoozNodes: Record<string, NodeInfo> = {};

    // Iterate through all devices
    Object.values(hass.devices).forEach((device) => {
      if (device.manufacturer === 'Zooz' && !device.labels.includes('hub')) {
        zoozNodes[device.id] = {
          name: device.name_by_user || device.name,
          device_id: device.id,
        } as NodeInfo;
      }
    });

    // If no Zooz devices are found, return early
    if (!Object.keys(zoozNodes).length) {
      return;
    }

    Object.values(hass.entities).forEach((entity) => {
      const node = zoozNodes[entity.device_id];
      if (!node) return;

      if (entity.entity_id.endsWith('_node_status')) {
        const state = hass.states[entity.entity_id]!;
        node.statusState = state;
      } else if (entity.entity_id.endsWith('_last_seen')) {
        const state = hass.states[entity.entity_id]!;
        node.lastSeenState = state;
        node.lastSeen = new Date(state.state).getTime();
      }
    });

    // Separate dead nodes and live nodes
    const nodes = Object.values(zoozNodes);
    const deadNodes = nodes.filter(
      (node) => !['alive', 'asleep'].includes(node.statusState.state),
    );

    const liveNodes = nodes
      .filter((node) => node.statusState.state === 'alive')
      .sort((a, b) => {
        if (a.lastSeen && b.lastSeen) {
          return b.lastSeen - a.lastSeen;
        } else if (a.lastSeen) {
          return -1;
        } else if (b.lastSeen) {
          return 1;
        }
        return 0;
      });

    const asleepNodes = nodes
      .filter((node) => node.statusState.state === 'asleep')
      .sort((a, b) => {
        if (a.lastSeen && b.lastSeen) {
          return b.lastSeen - a.lastSeen;
        } else if (a.lastSeen) {
          return -1;
        } else if (b.lastSeen) {
          return 1;
        }
        return 0;
      });

    // todo - don't set raw objects to properties of this...
    if (!equal(deadNodes, this._deadNodes)) {
      this._deadNodes = deadNodes;
    }
    if (!equal(liveNodes, this._liveNodes)) {
      this._liveNodes = liveNodes;
    }
    if (!equal(asleepNodes, this._sleepingNodes)) {
      this._sleepingNodes = asleepNodes;
    }
  }

  // card configuration
  static getConfigElement() {
    return document.createElement('zooz-nodes-status-editor');
  }

  /**
   * Renders the room summary card
   * @returns {TemplateResult} The rendered HTML template
   */
  override render(): TemplateResult {
    if (this.isPreview) {
      this._deadNodes.splice(1);
      this._liveNodes.splice(1);
      this._sleepingNodes.splice(1);
    }

    return html`
      <ha-card header="${this._config.title || 'Zooz Nodes Status'}">
        <div
          class="card-content"
          style="${styleMap({
            '--columns': this._config.columns,
          })}"
        >
          ${this._deadNodes.length === 0 &&
          this._liveNodes.length === 0 &&
          this._sleepingNodes.length === 0
            ? html`<div class="not-found">No Zooz devices found</div>`
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

    return html`
      <div class="node-item ${isCompact ? 'compact' : ''}">
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
