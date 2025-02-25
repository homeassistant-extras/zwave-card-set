# Multi Relay Card

A custom card for Home Assistant that displays and controls your ZEN16 Multi Relay device with a clean interface. This card provides an at-a-glance view of your relay states, device status, and allows for easy control of connected devices through multiple channels.

![card](../assets/cards/info/multi-relay/card.png)

## Features

- Controls multiple relay channels independently
- Displays ZEN16 Multi Relay status with visual indicators
- Shows firmware information
- Displays last seen timestamp
- Monitors individual relay states
- Responsive design that works on both desktop and mobile
- Easy configuration through the Home Assistant UI

## Configuration

| Name      | Type   | Default                      | Description                       |
| --------- | ------ | ---------------------------- | --------------------------------- |
| device_id | string | _Required_                   | The device ID of your ZEN16 relay |
| title     | string | "Multi Relay"                | Custom title for the card         |
| icon      | string | "mdi:electric-switch-closed" | Custom icon for the relay         |

## Usage

1. Install the card in your Home Assistant instance
2. Add the card to your dashboard through the UI
3. Configure the card with your device ID
   - if using YAML, this is the device id, not an entity id.

Example configuration in YAML:

```yaml
type: custom:zwave-multi-relay
device_id: your_device_id_here
title: Basement Multi Relay
```

```yaml
type: custom:zwave-multi-relay
device_id: your_device_id_here
```

## Status Indicators

The card displays several important status indicators:

- **Firmware Information**: Current firmware version
- **Last Seen**: When the device last communicated with your system
- **Node Status**: Current operational status of the device
- **Relay States**: Current state of each relay channel
- **Power Monitoring**: Current power usage per channel (if supported)

## Interactive Elements

All elements on the card support:

- Tap action: Toggles the state of individual relays
- Hold action: Opens more information about the specific relay channel
- Double-tap action: Opens more information about the relay device

## Requirements

- Home Assistant
- At least one ZEN16 Multi Relay device
- Z-Wave integration configured in Home Assistant

## Support

For issues and feature requests, please visit the [GitHub repository](https://github.com/homeassistant-extras/zwave-card-set).
