# Steam Owned HumbleBundle Games

A Tampermonkey userscript that highlights games on Humble Bundle when a matching title is already present in your Steam library.

## Features

- Queries Steam directly through Tampermonkey without a third-party CORS proxy.
- Keeps the Steam Web API key and SteamID64 in Tampermonkey storage instead of the source file.
- Detects games added dynamically by Humble Bundle pages.
- Preserves letters, numbers, and international characters when matching titles.
- Distinguishes exact title matches from cases where only the base game can be verified.
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

## Edition matching

Steam's owned-games response exposes owned game apps, but it does not reliably expose the exact store package or commercial edition that granted them. The script therefore uses conservative title-based rules:

- **Owned on Steam** means the normalized Humble title exactly matches a title returned by Steam.
- **Base game owned — edition extras not verified** means Humble lists a recognized commercial edition suffix, such as Deluxe, Ultimate, Gold, GOTY, Complete, or Standard Edition, and the corresponding base title is owned.
- No ownership label is shown when neither test succeeds.

For example, if Steam reports `Borderlands 3`:

- `Borderlands 3 Standard Edition` is shown as base-game ownership with unverified extras.
- `Borderlands 3 Super Deluxe Edition` is also shown as base-game ownership with unverified extras; the script does not claim that its Season Pass or DLC is owned.

The fallback deliberately does not strip markers such as Remastered, Definitive Edition, Anniversary Edition, Enhanced Edition, Director's Cut, Redux, or Reloaded. Those names may identify a materially different Steam app rather than a package around the same base game.

These rules reduce false "fully owned" results but cannot prove DLC or package ownership. Exact Steam App ID and package-component data would be needed for that.

## SteamDB

SteamDB is useful for manually researching app, package, bundle, and DLC relationships. However, SteamDB states that it does not provide a public API and does not permit automated scraping. The userscript therefore does not query SteamDB.

A future maintainable approach could use a small, reviewed data file containing known edition mappings sourced from official Steam store/package information. Such data would still require updates when publishers change their editions.

## Updating

Tampermonkey checks the `@updateURL` in the userscript metadata. Increase `@version` whenever a released script changes.

## Attribution

This project was originally based on Kevin Batdorf's userscript gist:

<https://gist.github.com/KevinBatdorf/c499d71021e434327892c3a7ea5702b7>

The current repository contains a maintained revision with security, configuration, matching, and dynamic-page improvements.

## License status

No open-source license is currently granted by this repository. The original source did not include an explicit license, so redistribution and licensing should be clarified with the original author before treating the project as freely reusable.
