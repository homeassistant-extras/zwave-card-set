import type { State } from '@type/homeassistant';

/**
 * Helper function to create a state object
 * @param entity_id
 * @param state
 * @param attributes
 * @returns State object
 */
export const createState = (
  entity_id: string,
  state: string,
  attributes = {},
): State => {
  return {
    entity_id,
    state,
    attributes,
    domain: entity_id.split('.')[0]!,
  };
};
