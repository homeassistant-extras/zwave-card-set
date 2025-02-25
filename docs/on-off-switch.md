# On/Off Switch Card

A custom card for Home Assistant that displays and controls your ZEN71 On/Off Switch device with a clean interface. This card provides an at-a-glance view of your switch's state, device status, and allows for easy control of connected devices.

![card](../assets/cards/info/on-off-switch/card.png)

## Features

- Controls switch on/off state
- Displays ZEN71 On/Off Switch status with visual indicators
- Shows firmware information
- Displays last seen timestamp
- Monitors switch state
- Responsive design that works on both desktop and mobile
- Easy configuration through the Home Assistant UI

## Configuration

| Name      | Type   | Default                         | Description                        |
| --------- | ------ | ------------------------------- | ---------------------------------- |
| device_id | string | _Required_                      | The device ID of your ZEN71 switch |
| title     | string | "On/Off Switch"                 | Custom title for the card          |
| icon      | string | "mdi:toggle-switch-variant-off" | Custom icon for the switch         |

## Usage

1. Install the card in your Home Assistant instance
2. Add the card to your dashboard through the UI
3. Configure the card with your device ID
   - if using YAML, this is the device id, not an entity id.

Example configuration in YAML:

```yaml
type: custom:zwave-on-off-switch
device_id: your_device_id_here
title: Kitchen Light Switch
```

```yaml
type: custom:zwave-on-off-switch
device_id: your_device_id_here
```

## Status Indicators

The card displays several important status indicators:

- **Firmware Information**: Current firmware version
- **Last Seen**: When the device last communicated with your system
- **Node Status**: Current operational status of the device
- **Switch State**: Current on/off state of the switch

## Interactive Elements

All elements on the card support:

- Tap action: Toggles the state of the switch
- Hold action: Opens more information about the switch
- Double-tap action: Opens more information about the switch

## Requirements

- Home Assistant
- At least one ZEN71 On/Off Switch device
- Z-Wave integration configured in Home Assistant

## Support

For issues and feature requests, please visit the [GitHub repository](https://github.com/homeassistant-extras/zwave-card-set).
