# Dry Contact Relay Card

A custom card for Home Assistant that displays and controls your ZEN51 Dry Contact Relay device with a clean interface. This card provides an at-a-glance view of your relay's state, device status, and allows for easy control of connected devices.

![card](../assets/cards/info/dry-contact-relay/card.png)

## Features

- Controls dry contact relay state
- Displays ZEN51 Dry Contact Relay status with visual indicators
- Shows firmware information
- Displays last seen timestamp
- Monitors relay state
- Responsive design that works on both desktop and mobile
- Easy configuration through the Home Assistant UI

## Configuration

| Name      | Type   | Default               | Description                       |
| --------- | ------ | --------------------- | --------------------------------- |
| device_id | string | _Required_            | The device ID of your ZEN51 relay |
| title     | string | "Dry Contact Relay"   | Custom title for the card         |
| icon      | string | "mdi:electric-switch" | Custom icon for the relay         |

## Usage

1. Install the card in your Home Assistant instance
2. Add the card to your dashboard through the UI
3. Configure the card with your device ID
   - if using YAML, this is the device id, not an entity id.

Example configuration in YAML:

```yaml
type: custom:zooz-dry-contact-relay
device_id: your_device_id_here
title: Garage Door Relay
```

```yaml
type: custom:zooz-dry-contact-relay
device_id: your_device_id_here
```

## Status Indicators

The card displays several important status indicators:

- **Firmware Information**: Current firmware version
- **Last Seen**: When the device last communicated with your system
- **Node Status**: Current operational status of the device
- **Relay State**: Current state of the dry contact relay

## Interactive Elements

All elements on the card support:

- Tap action: Toggles the state of the relay
- Hold action: Opens more information about the relay
- Double-tap action: Opens more information about the relay

## Requirements

- Home Assistant
- At least one ZEN51 Dry Contact Relay device
- Z-Wave integration configured in Home Assistant

## Support

For issues and feature requests, please visit the [GitHub repository](https://github.com/homeassistant-extras/zooz-card-set).
