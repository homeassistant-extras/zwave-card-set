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
    --icon-size: 42px;
    --icon-gap: 12px;
    position: relative;
  }

  /* Icon container styling */
  .icon {
    background-color: var(--background-color);
    align-self: center;
    border-radius: 50%;
    position: relative;
    display: flex;
    justify-content: center;
    width: var(--icon-size);
    height: var(--icon-size);
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
    position: relative;
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
    grid-template-columns: auto minmax(200px, 1fr) auto auto minmax(
        calc(var(--icon-size) * 2 + var(--icon-gap)),
        auto
      );
    grid-gap: 12px;
    align-items: center;
  }

  .firmware {
    display: flex;
    gap: 20px;
    grid-column: 1 / 3;
  }

  .firmware-info {
    min-width: 0;
    flex: 1;
  }

  .seen {
    grid-column: 3;
  }

  .status {
    grid-column: 4;
  }

  .entities {
    grid-column: 5;
    display: flex;
    gap: var(--icon-gap);
    justify-content: flex-end;
    min-width: calc(var(--icon-size) * 2 + var(--icon-gap));
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
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .status-value {
    font-size: 1rem;
  }

  .status-label {
    font-size: 0.9rem;
    color: var(--secondary-text-color);
  }
`;
