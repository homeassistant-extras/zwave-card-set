import { css } from 'lit';

/**
 * Static CSS styles for the Z-Wave Nodes Status Card
 * Defines the grid layout and styling for all card elements
 */
export const styles = css`
  ha-card {
    padding: 8px 0;
  }

  .card-header {
    padding: 8px 16px;
    display: flex;
    justify-content: space-between;
  }

  .card-content {
    padding: 16px;
  }

  .status-row {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
  }

  .status-label {
    color: var(--secondary-text-color);
    font-weight: 500;
  }

  .status-good {
    color: var(--success-color, #4caf50);
  }

  .status-warning {
    color: var(--warning-color, #ff9800);
  }

  .status-bad {
    color: var(--error-color, #f44336);
  }

  .devices-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    cursor: pointer;
    margin-top: 8px;
    border-top: 1px solid var(--divider-color);
  }

  .devices-count {
    display: flex;
    align-items: center;
  }

  .devices-count ha-icon {
    margin-right: 8px;
  }

  .expand-icon {
    transition: transform 0.2s;
  }

  .devices-list {
    margin-top: 8px;
    max-height: 300px;
    overflow-y: auto;
  }

  .device-item {
    display: flex;
    align-items: center;
    padding: 4px 0;
  }

  .device-item ha-icon {
    margin-right: 8px;
    color: var(--secondary-text-color);
  }
`;
