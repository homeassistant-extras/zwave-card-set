import { css } from 'lit';

export const styles = css`
  span {
    font-size: 1.2em;
    font-weight: bold;
  }

  .device-center {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .manufacturer {
    margin-bottom: 16px;
  }

  .manufacturer h1 {
    font-size: 1.5em;
    font-weight: bold;
    margin: 0 0 12px 0;
    padding-bottom: 4px;
    border-bottom: 1px solid var(--divider-color, #e0e0e0);
  }

  .model {
    margin-bottom: 12px;
  }

  .model h2 {
    font-size: 1.2em;
    font-weight: bold;
    margin: 0 0 8px 4px;
    color: var(--secondary-text-color, #727272);
  }

  .devices {
    margin-left: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
`;
