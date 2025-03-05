import type { HomeAssistant } from '@type/homeassistant';
import {
  getZWaveNonHubs,
  processDeviceEntitiesAndCheckIfController,
} from '@util/hass';
import type { NodeInfo } from './types';

/**
 * Interface for categorized Z-Wave nodes
 */
export interface CategorizedNodes {
  /** Nodes that are reported as dead or not responding */
  deadNodes: NodeInfo[];

  /** Nodes that are actively communicating with the Z-Wave network */
  liveNodes: NodeInfo[];

  /** Nodes that are in sleep mode (usually battery-powered devices) */
  sleepingNodes: NodeInfo[];
}

/**
 * Splits a collection of Z-Wave nodes into categories based on their status.
 * Nodes are sorted by last seen timestamp within each category, with most recent first.
 *
 * @param {Record<string, NodeInfo>} zWaveNodes - Collection of Z-Wave nodes keyed by device ID
 * @returns {CategorizedNodes} Object containing arrays of nodes categorized as dead, live, or asleep
 */
const splitNodes = (zWaveNodes: Record<string, NodeInfo>): CategorizedNodes => {
  const nodes = Object.values(zWaveNodes);

  // Filter nodes that are neither alive nor asleep (typically dead nodes)
  const deadNodes = nodes.filter(
    (node) => !['alive', 'asleep'].includes(node.statusState?.state),
  );

  // Filter nodes that are alive and sort by lastSeen timestamp
  const liveNodes = nodes
    .filter((node) => node.statusState?.state === 'alive')
    .sort((a, b) => {
      if (a.lastSeen && b.lastSeen) {
        return b.lastSeen - a.lastSeen; // Most recent first
      } else if (a.lastSeen) {
        return -1; // Nodes with lastSeen come before those without
      } else if (b.lastSeen) {
        return 1;
      }
      return 0;
    });

  // Filter nodes that are asleep and sort by lastSeen timestamp
  const sleepingNodes = nodes
    .filter((node) => node.statusState?.state === 'asleep')
    .sort((a, b) => {
      if (a.lastSeen && b.lastSeen) {
        return b.lastSeen - a.lastSeen; // Most recent first
      } else if (a.lastSeen) {
        return -1; // Nodes with lastSeen come before those without
      } else if (b.lastSeen) {
        return 1;
      }
      return 0;
    });

  return { deadNodes, liveNodes, sleepingNodes: sleepingNodes };
};

/**
 * Retrieves and categorizes all Z-Wave nodes from Home Assistant.
 * Nodes are processed to extract status and last seen information,
 * then categorized and sorted based on their current state.
 *
 * @param {HomeAssistant} hass - Home Assistant instance containing device and entity information
 * @returns {CategorizedNodes} Object containing arrays of nodes categorized as dead, live, or asleep
 *
 * @example
 * // Get all Z-Wave nodes categorized by status
 * const { deadNodes, liveNodes, asleepNodes } = getZWaveNodes(hass);
 *
 * // Render nodes in each category
 * deadNodes.forEach(node => renderDeadNode(node));
 * liveNodes.forEach(node => renderLiveNode(node));
 * asleepNodes.forEach(node => renderAsleepNode(node));
 */
export const getZWaveNodes = (hass: HomeAssistant): CategorizedNodes => {
  // Object to store the Z-Wave devices indexed by device ID
  const zWaveNodes: Record<string, NodeInfo> = {};

  // Get all non-hub Z-Wave devices
  getZWaveNonHubs(hass).forEach((device) => {
    // Initialize basic node info
    const node = {
      name: device.name,
      device_id: device.id,
    } as NodeInfo;

    zWaveNodes[device.id] = node;

    // Process device entities to extract node status and last seen information
    processDeviceEntitiesAndCheckIfController(
      hass,
      device.id,
      (entity, state) => {
        if (entity.translation_key === 'node_status') {
          node.statusState = state;
        } else if (entity.translation_key === 'last_seen') {
          node.lastSeenState = state;
          node.lastSeen = new Date(state.state).getTime();
        }
      },
    );
  });

  // Split and categorize nodes by status
  return splitNodes(zWaveNodes);
};
