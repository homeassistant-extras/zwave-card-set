/**
 * Configuration utilities for feature flag management
 */

/**
 * Determines if a specified feature is enabled in the provided configuration
 *
 * @param config - The configuration object containing feature flags
 * @param feature - The specific feature to check for
 * @returns True if the feature is enabled, false otherwise
 *
 * @example
 * // Check if a feature is enabled
 * const isCompactEnabled = hasFeature(appConfig, 'compact');
 *
 * @remarks
 * - Returns false if config is null or undefined
 * - Returns false if the features array doesn't exist or doesn't include the specified feature
 */
export const hasFeature = <T extends string>(
  config: { features?: T[] } | null | undefined,
  feature: T,
): boolean => config?.features?.includes(feature) ?? false;
