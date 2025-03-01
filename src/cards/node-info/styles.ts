import { chevronToggleStyles } from '@util/styles';
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
  }

  /* Import shared chevron styles */
  ${chevronToggleStyles}

  /* Icon container styling */
  .icon {
    background-color: var(--background-color);
    align-self: center;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    width: var(--icon-size);
    height: var(--icon-size);
    min-width: var(--icon-size);
    min-height: var(--icon-size);
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
    padding: 12px;
  }

  ha-card.expanded {
    height: auto;
  }

  .grid {
    display: grid;
    grid-template-columns: auto minmax(150px, 1fr) auto auto minmax(
        calc(var(--icon-size) * 2 + var(--icon-gap)),
        auto
      );
    grid-gap: 12px;
    align-items: center;
    flex: 1;
  }

  .firmware {
    display: flex;
    gap: 10px;
    grid-column: 1 / 3;
  }

  .seen {
    grid-column: 3;
    max-width: 120px;
  }

  .status {
    grid-column: 4;
    max-width: 120px;
  }

  .entities {
    grid-column: 5;
    display: flex;
    gap: var(--icon-gap);
    justify-content: flex-end;
    min-width: calc(var(--icon-size) * 2 + var(--icon-gap));
  }

  .entities.wrap {
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .entity {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .sensors-container {
    grid-column: 1 / 6;
    position: relative;
    height: 0;
    overflow: hidden;
    margin: 0;
    padding: 0;
    transition:
      height 0.3s ease,
      margin-top 0.3s ease,
      padding-top 0.3s ease;
  }

  .sensors-container.expanded {
    height: auto;
    margin-top: 12px;
    border-top: 1px solid rgba(var(--rgb-primary-text-color), 0.12);
    padding-top: 12px;
  }

  .sensors {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
    width: 100%;
    margin-top: 8px;
  }

  .sensor-item {
    display: flex;
    align-items: center;
    gap: 8px;
    overflow: hidden;
  }

  .sensor {
    cursor: pointer;
  }

  .firmware-info {
    display: flex;
    flex-direction: column;
    cursor: pointer;
    min-width: 0;
    flex: 1;
    overflow: hidden;
  }

  .status-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    width: 100%;
    overflow: hidden;
  }

  .title {
    font-size: 1.1rem;
    font-weight: 500;
    margin: 0;
    width: 100%;
  }

  .status-label {
    font-size: 0.9rem;
    color: var(--secondary-text-color);
    max-width: 100%;
  }

  .ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Make toggle visible when card is hovered */
  ha-card:hover .toggle-chevron {
    opacity: 1;
  }
`;
