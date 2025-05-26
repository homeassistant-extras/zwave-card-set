import { html, type TemplateResult } from 'lit';

/**
 * Renders a Home Assistant icon wrapped in a div with an optional CSS class.
 *
 * @param icon - The name of the icon to display (e.g., "mdi:lightbulb").
 * @param className - Optional CSS class to apply to the wrapping div.
 * @returns A lit-html TemplateResult containing the icon markup.
 */
export const haIcon = (icon: string, className?: string): TemplateResult => {
  return html`<div class="${className}">
    <ha-icon icon="${icon}"></ha-icon>
  </div>`;
};
