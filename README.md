<p align="center">
    <img src="assets/z-wave.png" align="center" width="50%">
</p>
<p align="center"><h1 align="center">Z-Wave Card Set</h1></p>
<p align="center">
	<em>Boosting your Z-Wave integration.</em>
</p>

![Home Assistant](https://img.shields.io/badge/home%20assistant-%2341BDF5.svg?style=for-the-badge&logo=home-assistant&logoColor=white)
[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg?style=for-the-badge)](https://github.com/hacs/integration)

![GitHub Release](https://img.shields.io/github/v/release/homeassistant-extras/zwave-card-set?style=for-the-badge&logo=github)
![GitHub Pre-Release](https://img.shields.io/github/v/release/homeassistant-extras/zwave-card-set?include_prereleases&style=for-the-badge&logo=github&label=PRERELEASE)
![GitHub Tag](https://img.shields.io/github/v/tag/homeassistant-extras/zwave-card-set?style=for-the-badge&color=yellow)
![GitHub branch status](https://img.shields.io/github/checks-status/homeassistant-extras/zwave-card-set/main?style=for-the-badge)

![stars](https://img.shields.io/github/stars/homeassistant-extras/zwave-card-set.svg?style=for-the-badge)
![home](https://img.shields.io/github/last-commit/homeassistant-extras/zwave-card-set.svg?style=for-the-badge)
![commits](https://img.shields.io/github/commit-activity/y/homeassistant-extras/zwave-card-set?style=for-the-badge)
![license](https://img.shields.io/github/license/homeassistant-extras/zwave-card-set?style=for-the-badge&logo=opensourceinitiative&logoColor=white&color=0080ff)

<p align="center">Built with the tools and technologies:</p>
<p align="center">
	<img src="https://img.shields.io/badge/npm-CB3837.svg?style=for-the-badge&logo=npm&logoColor=white" alt="npm">
	<img src="https://img.shields.io/badge/Prettier-F7B93E.svg?style=for-the-badge&logo=Prettier&logoColor=black" alt="Prettier">
	<img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=for-the-badge&logo=TypeScript&logoColor=white" alt="TypeScript">
	<img src="https://img.shields.io/badge/GitHub%20Actions-2088FF.svg?style=for-the-badge&logo=GitHub-Actions&logoColor=white" alt="GitHub%20Actions">
	<img src="https://img.shields.io/badge/Lit-324FFF.svg?style=for-the-badge&logo=Lit&logoColor=white" alt="Lit">
</p>
<br>

## Overview

This project brings a set of cards to display info about your Z-Wave devices. Many of these are great if you have a dedicated status view for your network or connected devices.

## Cards

### [Device Center](src/cards/device-center/README.md)

See all your devices and their states and some controls if applicable in one place.

![card](assets/cards/device-center/card.png)

### [Z-Wave Nodes Status Card](src/cards/node-states/README.md)

Shows status and last seen time of all your nodes.

![card](assets/cards/node-status/card.png)

### [Hub Card](src/cards/hub-card/README.md)

Shows info about the Z-Wave Hub.

![card](assets/cards/hub-card/card.png)

### Info Cards

# Update for Info Cards section

#### [ZEN04 800LR - Smart Plug](docs/smart-plug.md)

Commonly used for controlling appliances and devices.

![card](assets/cards/info/smart-plug/card.png)

#### [ZEN16 - Multi Relay](docs/multi-relay.md)

Commonly used for controlling multiple independent circuits.

![card](assets/cards/info/multi-relay/card.png)

#### [ZEN30 - Double Switch](docs/double-switch.md)

Commonly used for light/fan switches.

![card](assets/cards/info/double-switch/card.png)

#### [ZEN32 - Scene Controller](docs/scene-controller.md)

Commonly used for scene and automation control.

![card](assets/cards/info/scene-controller/card.png)

#### [ZEN51 - Dry Contact Relay](docs/dry-contact-relay.md)

Commonly used for garage doors and other contact-based controls.

![card](assets/cards/info/dry-contact-relay/card.png)

#### [ZEN52 - Double Relay](docs/double-relay.md)

Commonly used for light/fan in wall.

![card](assets/cards/info/double-relay/card.png)

#### [ZEN55 LR - DC Signal Sensor](docs/dc-signal-sensor.md)

Commonly used for smoke sensor detection

![card](assets/cards/info/dc-signal-sensor/card.png)

#### [ZEN71 - On/Off Switch](docs/on-off-switch.md)

Commonly used for basic lighting control.

![card](assets/cards/info/on-off-switch/card.png)

More to come...

## Installation

### HACS (Recommended)

1. Open HACS in your Home Assistant instance
2. Click the menu icon in the top right and select "Custom repositories"
3. Add this repository URL and select "Dashboard" as the category
   - `https://github.com/homeassistant-extras/zwave-card-set`
4. Click "Install"

### Manual Installation

1. Download the `zwave-card-set.js` file from the latest release in the Releases tab.
2. Copy it to your `www/community/zwave-card-set/` folder
3. Add the following to your `configuration.yaml` (or add as a resource in dashboards menu)

```yaml
lovelace:
  resources:
    - url: /local/community/zwave-card-set/zwave-card-set.js
      type: module
```

Add the cards to your dashboard using the UI editor or YAML.

## Configuration Options

See the README files of the individual cards for configuration and detailed information.

- [Device Center](src/cards/device-center/README.md)
- [Z-Wave Nodes Status Card](src/cards/node-states/README.md)
- [Z-Wave Hub Card](src/cards/hub-card/README.md)
- Info Cards
  - [ZEN04 800LR - Smart Plug](docs/smart-plug.md)
  - [ZEN16 - Multi Relay](docs/multi-relay.md)
  - [ZEN30 - Double Switch](docs/double-switch.md)
  - [ZEN32 - Scene Controller](docs/scene-controller.md)
  - [ZEN51 - Dry Contact Relay](docs/dry-contact-relay.md)
  - [ZEN52 - Double Relay](docs/double-relay.md)
  - [ZEN55 LR - DC Signal Sensor](docs/dc-signal-sensor.md)
  - [ZEN71 - On/Off Switch](docs/on-off-switch.md)

Some cards may require the hub to be labeled with a "Hub" label:

![hub](assets/hub.png)

## Supported Devices

These are tested, others may work.

### Hubs

- ZST39 LR

### Switches

- ZEN30
- ZEN32
- ZEN71

### Plugs

- ZEN04 800LR

### Relays

- ZEN16
- ZEN51
- ZEN52

### Sensors

- ZEN55 LR

## Project Roadmap

- [x] **`Initial design`**: <strike>create initial room card based on button-card template in UI minimialist theme.</strike>
- [x] **`Editors`**: <strike>make sure stub configs and previews are solid.</strike>
- [ ] **`Node cards`**: show info about different nodes.
- [ ] **`Node status card sizing`**: make sizing dynamic, can't figure it out.
- [ ] **`Themes`**: test default theme, etc.
- [ ] **`Device Center`**: add docs and pics towards end.
- [ ] **`Sensors on info card`**: like plugs and stuff.

## Contributing

- **💬 [Join the Discussions](https://github.com/homeassistant-extras/zwave-card-set/discussions)**: Share your insights, provide feedback, or ask questions.
- **🐛 [Report Issues](https://github.com/homeassistant-extras/zwave-card-set/issues)**: Submit bugs found or log feature requests for the `zwave-card-set` project.
- **💡 [Submit Pull Requests](https://github.com/homeassistant-extras/zwave-card-set/blob/main/CONTRIBUTING.md)**: Review open PRs, and submit your own PRs.
- **📣 [Check out discord](https://discord.gg/F28wupKC)**: Need further help, have ideas, want to chat?

<details closed>
<summary>Contributing Guidelines</summary>

1. **Fork the Repository**: Start by forking the project repository to your github account.
2. **Clone Locally**: Clone the forked repository to your local machine using a git client.
   ```sh
   git clone https://github.com/homeassistant-extras/zwave-card-set
   ```
3. **Create a New Branch**: Always work on a new branch, giving it a descriptive name.
   ```sh
   git checkout -b new-feature-x
   ```
4. **Make Your Changes**: Develop and test your changes locally.
5. **Commit Your Changes**: Commit with a clear message describing your updates.
   ```sh
   git commit -m 'Implemented new feature x.'
   ```
6. **Push to github**: Push the changes to your forked repository.
   ```sh
   git push origin new-feature-x
   ```
7. **Submit a Pull Request**: Create a PR against the original project repository. Clearly describe the changes and their motivations.
8. **Review**: Once your PR is reviewed and approved, it will be merged into the main branch. Congratulations on your contribution!
</details>

## License

This project is protected under the MIT License. For more details, refer to the [LICENSE](LICENSE) file.

## Acknowledgments

- Built using [LitElement](https://lit.dev/)
- Inspired by Home Assistant's chip design
- Button-Card was a huge inspo
- Thanks to all contributors!

[![contributors](https://contrib.rocks/image?repo=homeassistant-extras/zwave-card-set)](https://github.com{/homeassistant-extras/zwave-card-set/}graphs/contributors)

[![ko-fi](https://img.shields.io/badge/buy%20me%20a%20coffee-72A5F2?style=for-the-badge&logo=kofi&logoColor=white)](https://ko-fi.com/N4N71AQZQG)

## Build Status

### Main

[![Bump & Tag](https://github.com/homeassistant-extras/zwave-card-set/actions/workflows/push.yml/badge.svg?branch=main)](https://github.com/homeassistant-extras/zwave-card-set/actions/workflows/push.yml)
[![Fast Forward Check](https://github.com/homeassistant-extras/zwave-card-set/actions/workflows/pull_request.yaml/badge.svg?branch=main)](https://github.com/homeassistant-extras/zwave-card-set/actions/workflows/pull_request.yaml)

### Release

[![Bump & Tag](https://github.com/homeassistant-extras/zwave-card-set/actions/workflows/push.yml/badge.svg?branch=release)](https://github.com/homeassistant-extras/zwave-card-set/actions/workflows/push.yml)
[![Merge](https://github.com/homeassistant-extras/zwave-card-set/actions/workflows/merge.yaml/badge.svg)](https://github.com/homeassistant-extras/zwave-card-set/actions/workflows/merge.yaml)
