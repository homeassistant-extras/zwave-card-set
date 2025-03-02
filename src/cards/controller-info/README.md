# Z-Wave Controller Card

A custom card for Home Assistant that displays the status of your Z-Wave controller and connected devices. This card provides a clean interface to monitor your controller's status, signal strength, and allows you to quickly view all connected Z-Wave devices.

![card](../../../assets/cards/controller-info/card.png)

## Features

- Displays the Z-Wave controller status with visual indicators
- Shows RSSI signal strength with color-coded values
- Lists all connected Z-Wave devices with expandable/collapsible view
- Direct links to device configuration pages
- Automatic controller detection when no specific device is specified
- Responsive design that works on both desktop and mobile
- Easy configuration through the Home Assistant UI

## Configuration

| Name      | Type   | Default             | Description                                                                                                                |
| --------- | ------ | ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| device_id | string | Auto-detected       | Optional: The device ID of a Z-Wave controller. If not specified, the card will attempt to find a controller automatically |
| title     | string | Controller/Hub name | Optional: Custom title for the card                                                                                        |

## Usage

1. Install the card in your Home Assistant instance
2. Add the card to your dashboard through the UI
3. Configure the card settings if needed

Example configuration in YAML:

```yaml
type: custom:zwave-controller
```

With specific controller and custom title:

```yaml
type: custom:zwave-controller
device_id: your_controller_device_id
title: Main Z-Wave Controller
```

## Status Indicators

- Controller Status: Shows the current operational status of your Z-Wave controller
- RSSI Indicators:
  - 🟢 Green: Good signal strength (better than -60 dBm)
  - 🟡 Amber: Fair signal strength (between -60 and -80 dBm)
  - 🔴 Red: Poor signal strength (worse than -80 dBm)

## Connected Devices

The card allows you to:

- See the total count of connected Z-Wave devices
- Expand/collapse the device list
- Click on any device to go directly to its configuration page

## Integration with Device Center

This card can also be used within the Z-Wave Device Center. When used in the Device Center, it will automatically show information about the relevant controller without requiring additional configuration.

## Event Handling

The card listens for `hass-update-controller` events, allowing it to update its state when triggered externally by other components or automations.

## Requirements

- Home Assistant
- At least one Z-Wave controller/hub
- Z-Wave JS integration configured in Home Assistant

## Support

For issues and feature requests, please visit the [GitHub repository](https://github.com/homeassistant-extras/zwave-card-set).
