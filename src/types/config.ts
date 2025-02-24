/**
 * Configuration interface for defining custom card components.
 *
 * @interface CardConfig
 * @property {CustomElementConstructor} element - The constructor for the custom element that implements this card.
 *                                               Must extend HTMLElement and be registered as a custom web component.
 *
 * @property {string} type - The unique identifier for this type of card.
 *                          Used for card type discrimination and routing.
 *
 * @property {string} name - The display name of the card type.
 *                          Used in UI elements where the card type needs to be shown to users.
 *
 * @property {string} description - A detailed description of the card's purpose and functionality.
 *                                 Provides context for users about when and how to use this type of card.
 *
 * @example
 * const myCardConfig: CardConfig = {
 *   element: MyCustomCard,
 *   type: "analytics-card",
 *   name: "Analytics Card",
 *   description: "Displays key metrics and analytics data in a card format"
 * };
 */
export interface CardConfig {
  /**
   * The constructor for the custom element that implements this card.
   * Must extend HTMLElement and be registered as a custom web component.
   * This element will be instantiated when creating new instances of the card.
   *
   * @example
   * class MyCard extends HTMLElement {
   *   constructor() {
   *     super();
   *     // Card implementation
   *   }
   * }
   * customElements.define('my-card', MyCard);
   */
  element: CustomElementConstructor;

  /**
   * The unique identifier for this type of card.
   * Used for card type discrimination and routing.
   * Should be a lowercase, hyphen-separated string.
   *
   * @example
   * type: "analytics-dashboard"
   * type: "user-profile"
   */
  type: string;

  /**
   * The human-readable display name of the card type.
   * Used in UI elements where the card type needs to be shown to users.
   * Should be clear and concise, using proper capitalization.
   *
   * @example
   * name: "Analytics Dashboard"
   * name: "User Profile Card"
   */
  name: string;

  /**
   * A detailed description of the card's purpose and functionality.
   * Provides context for users about when and how to use this type of card.
   * Should explain the card's main features and use cases.
   *
   * @example
   * description: "Displays key performance metrics and analytics data in a
   * customizable dashboard format with interactive charts and filters."
   */
  description: string;
}
