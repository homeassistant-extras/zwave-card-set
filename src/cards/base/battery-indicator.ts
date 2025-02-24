import { LitElement, css, html, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';

/**
 * Battery Indicator
 */
export class BatteryIndicator extends LitElement {
  @property({ type: Number })
  level = 0;

  /**
   * Returns the component's styles
   */
  static override styles = css`
    :host {
      display: inline-block;
      width: 25px;
      height: 25px;
      margin-right: 8px;
      vertical-align: middle;
    }

    .battery-text {
      fill: var(--primary-text-color, #fff);
      font-size: 16px;
      font-weight: bold;
      text-anchor: middle;
      alignment-baseline: middle;
    }

    .battery-text tspan {
      font-size: 10px;
    }

    .battery-circle {
      transform: rotate(-90deg);
      transform-origin: 50% 50%;
      transition: stroke-dashoffset 0.3s ease;
    }
  `;

  /**
   * Renders the card
   * @returns {TemplateResult} The rendered HTML template
   */
  override render(): TemplateResult {
    const radius = 20.5;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (this.level / 100) * circumference;

    return html`
      <svg viewBox="0 0 50 50">
        <circle
          cx="25"
          cy="25"
          r="${radius}"
          stroke="green"
          stroke-width="3"
          fill="var(--card-background-color)"
          class="battery-circle"
          style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${offset};"
        />
        <text x="50%" y="54%" class="battery-text">
          ${Math.round(this.level)}
          <tspan>%</tspan>
        </text>
      </svg>
    `;
  }
}
