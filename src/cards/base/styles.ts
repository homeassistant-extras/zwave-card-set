import {
  homeAssistantRgbColors,
  minimalistRgbColors,
  themeColors,
} from '@util/theme';
import { css } from 'lit';

export const styles = css`
  /* Card Themes and Colors */
  :host {
    ${homeAssistantRgbColors}
    ${minimalistRgbColors}
    ${themeColors}
  }

  :host {
    --icon-color: rgba(var(--rgb-icon), 0.2);
    --background-color: rgba(var(--rgb-icon-background), 0.05);
  }

  /* Icon container styling */
  .icon {
    background-color: var(--background-color);
    align-self: center;
    border-radius: 50%;
    position: relative;
    display: flex;
    justify-content: center;
    width: 42px;
    height: 42px;
    cursor: pointer;
  }

  /* Remove background if no ha-state-icon */
  .icon:not(:has(ha-state-icon)) {
    background-color: inherit;
  }

  /* State icon styling */
  .icon ha-state-icon {
    width: 50%;
    color: var(--icon-color);
    --mdc-icon-size: 100%;
  }

  ha-card {
    background: var(
      --ha-card-background,
      var(--card-background-color, #1c1c1c)
    );
    border-radius: var(--ha-card-border-radius, 12px);
    padding: 12px;
    color: var(--primary-text-color, #fff);
  }

  .grid {
    display: grid;
    grid-template-areas: 'firmware firmware firmware seen seen status . . e1 e2';
  }

  .firmware {
    grid-area: firmware;
    display: flex;
    gap: 20px;
  }

  .seen {
    grid-area: seen;
  }

  .status {
    grid-area: status;
  }

  .e1 {
    grid-area: e1;
  }

  .e2 {
    grid-area: e2;
  }

  .firmware-info {
    display: flex;
    flex-direction: column;
    cursor: pointer;
  }

  .firmware-info state-display {
    font-size: 0.9rem;
    color: var(--secondary-text-color);
  }

  .status-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
  }

  .title {
    font-size: 1.1rem;
    font-weight: 500;
    margin: 0;
  }

  .status-value {
    font-size: 1rem;
  }

  .status-label {
    font-size: 0.9rem;
    color: var(--secondary-text-color);
  }
`;
