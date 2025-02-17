import {
  homeAssistantRgbColors,
  minimalistRgbColors,
  themeColors,
} from '@/util/theme';
import { css } from 'lit';

/**
 * Static CSS styles for the Zooz Nodes Status Card
 * Defines the grid layout and styling for all card elements
 */
export const styles = css`
  :host {
    ${homeAssistantRgbColors}
    ${minimalistRgbColors}
    ${themeColors}
    --state-icon: rgb(var(--rgb-icon));
    --state-display: rgb(var(--rgb-text));
    --columns: 3;
  }

  .card-content {
    padding: 16px;
  }

  .not-found {
    text-align: center;
    padding: 16px;
    color: var(--secondary-text-color);
  }

  .section-header {
    font-weight: bold;
    font-size: 16px;
    margin: 8px 0 16px 0;
    color: var(--primary-text-color);
  }

  .nodes-grid {
    display: grid;
    grid-template-columns: repeat(var(--columns), 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }

  .node-item {
    padding: 12px;
  }

  .node-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
  }

  .node-status-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  ha-state-icon {
    --mdc-icon-size: 24px;
    color: var(--state-icon);
  }

  state-display {
    color: var(--state-display);
  }

  .node-name {
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }
`;
