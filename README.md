# Steam Owned HumbleBundle Games

A Tampermonkey userscript that highlights games on Humble Bundle when a matching title is already present in your Steam library.

## Features

- Queries Steam directly through Tampermonkey without a third-party CORS proxy.
- Keeps the Steam Web API key and SteamID64 in Tampermonkey storage instead of the source file.
- Detects games added dynamically by Humble Bundle pages.
- Preserves letters, numbers, and international characters when matching titles.
- Shows a visible error when configuration or the Steam response is invalid.

## Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) for your browser.
2. Open the [raw userscript](https://raw.githubusercontent.com/Mega-Bits/steam-owned-humblebundle-games/main/steam-owned-humblebundle-games.user.js).
3. Confirm the installation in Tampermonkey.

## Configure

1. Create a Steam Web API key at <https://steamcommunity.com/dev/apikey>.
2. Find your SteamID64 from your Steam account details.
3. Open the Tampermonkey menu while visiting Humble Bundle.
4. Select **Configure Steam API key** and **Configure SteamID64**.
5. Reload the Humble Bundle page.

Steam can only return the owned-games list when the account's game details are visible to the API request. If no games are returned, review the Steam privacy settings as well as the API key and SteamID64.

## Security

The script sends the configured API key and SteamID64 directly to `api.steampowered.com`. It does not send them through the previous `test.cors.workers.dev` proxy.

Tampermonkey storage is convenient, but it is not a dedicated secrets vault. Do not share an exported userscript configuration containing private values.

## Matching limitations

The script currently compares normalized game titles. Different editions, renamed games, bundles with extra suffixes, or localized titles may not match perfectly. Exact Steam App ID matching would be preferable where Humble exposes an App ID or Steam store link.

## Updating

Tampermonkey checks the `@updateURL` in the userscript metadata. Increase `@version` whenever a released script changes.

## Attribution

This project was originally based on Kevin Batdorf's userscript gist:

<https://gist.github.com/KevinBatdorf/c499d71021e434327892c3a7ea5702b7>

The current repository contains a maintained revision with security, configuration, matching, and dynamic-page improvements.

## License status

No open-source license is currently granted by this repository. The original source did not include an explicit license, so redistribution and licensing should be clarified with the original author before treating the project as freely reusable.
