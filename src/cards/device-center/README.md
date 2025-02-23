# Zooz Device Center Card

A custom card for Home Assistant that provides a centralized view of all your Zooz devices, grouped by model type. This card organizes your ZEN55 sensors and ZEN52 relays in a clean, organized layout while also displaying your Zooz hub information when no area filter is applied.

![card](../../../assets/cards/device-center/card.png)

## Features

- Groups devices by model type (ZEN55 LR Sensors, ZEN52 Double Relays)
- Optional area filtering to show devices from specific areas
- Displays Zooz hub information when no area is specified
- Automatically organizes devices into logical sections
- Clean, organized layout for easy viewing
- Responsive design that works on both desktop and mobile
- Easy configuration through the Home Assistant UI

## Configuration

| Name | Type   | Default | Description                                         |
| ---- | ------ | ------- | --------------------------------------------------- |
| area | string | none    | Optional area ID to filter devices by specific area |

## Usage

1. Install the card in your Home Assistant instance
2. Add the card to your dashboard through the UI
3. Optionally configure an area filter

Example configuration in YAML:

```yaml
type: custom:zooz-device-center
```

With area filtering:

```yaml
type: custom:zooz-device-center
area: living_room
```

## Device Sections

The card organizes devices into the following sections:

- **Hub Information** (when no area specified)
  - Shows your Zooz hub status and information
- **ZEN55 LR Sensors**
  - Groups all your ZEN55 smoke and CO detectors
- **ZEN52 Double Relays**
  - Groups all your ZEN52 double relay devices

More to come...

Each device in these sections maintains its individual card functionality, allowing you to:

- View device status
- Check firmware information
- Monitor last seen timestamps
- Access device-specific controls

## Requirements

- Home Assistant
- At least one Zooz Z-Wave device
- Z-Wave integration configured in Home Assistant

## Support

For issues and feature requests, please visit the [GitHub repository](https://github.com/homeassistant-extras/zooz-card-set).
