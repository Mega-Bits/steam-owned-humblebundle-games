// ==UserScript==
// @name         Steam Owned HumbleBundle Games
// @namespace    https://github.com/Mega-Bits
// @version      0.2.0
// @description  Highlights Humble Bundle games that are already in your Steam library
// @author       Kevin Batdorf (original), Mega-Bits (maintenance)
// @match        https://www.humblebundle.com/*
// @icon         https://www.google.com/s2/favicons?domain=humblebundle.com
// @homepageURL  https://github.com/Mega-Bits/steam-owned-humblebundle-games
// @supportURL   https://github.com/Mega-Bits/steam-owned-humblebundle-games/issues
// @updateURL    https://raw.githubusercontent.com/Mega-Bits/steam-owned-humblebundle-games/main/steam-owned-humblebundle-games.user.js
// @downloadURL  https://raw.githubusercontent.com/Mega-Bits/steam-owned-humblebundle-games/main/steam-owned-humblebundle-games.user.js
// @run-at       document-idle
// @connect      api.steampowered.com
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

// Originally based on: https://gist.github.com/KevinBatdorf/c499d71021e434327892c3a7ea5702b7

(function() {
    'use strict';

    const CONFIG_KEYS = {
        apiKey: 'steamApiKey',
        steamId: 'steamId',
    };

    const GAME_SELECTOR = '.content-choice-title, .tier-item-view .item-title';
    const OWNED_LABEL_CLASS = 'steam-owned-label';
    const OWNED_CARD_CLASS = 'steam-owned-game';

    GM_addStyle(`
        .${OWNED_CARD_CLASS} {
            box-shadow: 0 0 5px 5px #c368ff !important;
        }

        .${OWNED_LABEL_CLASS} {
            display: block;
            margin: -0.25rem 0 1rem;
            padding-top: 0;
            color: rgb(195 104 255);
            font-weight: 700;
        }

        .steam-owned-status {
            position: fixed;
            right: 1rem;
            bottom: 1rem;
            z-index: 2147483647;
            max-width: 24rem;
            padding: 0.75rem 1rem;
            border-radius: 0.4rem;
            background: rgba(31, 31, 31, 0.95);
            color: #fff;
            box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.35);
            font: 14px/1.4 sans-serif;
        }
    `);

    const normalizeTitle = (value) => String(value ?? '')
        .normalize('NFKD')
        .replace(/\p{M}/gu, '')
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .trim();

    const showStatus = (message, timeout = 8000) => {
        document.querySelector('.steam-owned-status')?.remove();

        const status = document.createElement('div');
        status.className = 'steam-owned-status';
        status.textContent = message;
        document.body.append(status);

        if (timeout > 0) {
            window.setTimeout(() => status.remove(), timeout);
        }
    };

    const saveSetting = (key, label, validate) => {
        const currentValue = GM_getValue(key, '');
        const value = window.prompt(`Enter your ${label}:`, currentValue);

        if (value === null) return;

        const trimmedValue = value.trim();
        if (trimmedValue && !validate(trimmedValue)) {
            window.alert(`The ${label} does not have the expected format.`);
            return;
        }

        GM_setValue(key, trimmedValue);
        window.alert(`${label} saved. Reload the page to apply the change.`);
    };

    GM_registerMenuCommand('Configure Steam API key', () => {
        saveSetting(CONFIG_KEYS.apiKey, 'Steam Web API key', (value) => /^[a-f0-9]{32}$/i.test(value));
    });

    GM_registerMenuCommand('Configure SteamID64', () => {
        saveSetting(CONFIG_KEYS.steamId, 'SteamID64', (value) => /^\d{17}$/.test(value));
    });

    GM_registerMenuCommand('Clear Steam configuration', () => {
        GM_setValue(CONFIG_KEYS.apiKey, '');
        GM_setValue(CONFIG_KEYS.steamId, '');
        window.alert('Steam configuration cleared.');
    });

    const requestOwnedGames = (apiKey, steamId) => new Promise((resolve, reject) => {
        const params = new URLSearchParams({
            key: apiKey,
            steamid: steamId,
            format: 'json',
            include_appinfo: '1',
            include_played_free_games: '1',
        });

        GM_xmlhttpRequest({
            method: 'GET',
            url: `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?${params}`,
            responseType: 'json',
            timeout: 15000,
            onload: (result) => {
                if (result.status < 200 || result.status >= 300) {
                    reject(new Error(`Steam API returned HTTP ${result.status}`));
                    return;
                }

                const response = result.response?.response;
                if (!response || !Array.isArray(response.games)) {
                    reject(new Error('Steam returned no game list. Check the API key, SteamID64, and game-details privacy setting.'));
                    return;
                }

                resolve(response);
            },
            ontimeout: () => reject(new Error('Steam API request timed out.')),
            onerror: () => reject(new Error('Steam API request failed.')),
        });
    });

    const removeOwnedState = (node) => {
        if (node.nextElementSibling?.classList.contains(OWNED_LABEL_CLASS)) {
            node.nextElementSibling.remove();
        }

        node.closest('.js-item-details')
            ?.querySelector('.img-container')
            ?.classList.remove(OWNED_CARD_CLASS);

        node.closest('.content-choice')?.classList.remove(OWNED_CARD_CLASS);
    };

    const markOwned = (node) => {
        const label = document.createElement('strong');
        label.className = OWNED_LABEL_CLASS;
        label.textContent = 'Owned on Steam';
        node.insertAdjacentElement('afterend', label);

        node.closest('.js-item-details')
            ?.querySelector('.img-container')
            ?.classList.add(OWNED_CARD_CLASS);

        node.closest('.content-choice')?.classList.add(OWNED_CARD_CLASS);
    };

    const startPageObserver = (ownedTitles) => {
        const scanPage = () => {
            document.querySelectorAll(GAME_SELECTOR).forEach((node) => {
                const title = normalizeTitle(node.textContent);
                if (!title || node.dataset.steamCheckedTitle === title) return;

                removeOwnedState(node);
                node.dataset.steamCheckedTitle = title;

                if (ownedTitles.has(title)) {
                    markOwned(node);
                }
            });
        };

        let scanTimer;
        const scheduleScan = () => {
            window.clearTimeout(scanTimer);
            scanTimer = window.setTimeout(scanPage, 100);
        };

        scanPage();

        const observer = new MutationObserver(scheduleScan);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
        });
    };

    const main = async () => {
        const apiKey = GM_getValue(CONFIG_KEYS.apiKey, '').trim();
        const steamId = GM_getValue(CONFIG_KEYS.steamId, '').trim();

        if (!apiKey || !steamId) {
            showStatus('Configure your Steam API key and SteamID64 from the Tampermonkey menu.', 0);
            console.warn('Steam Owned HumbleBundle Games: configuration is missing.');
            return;
        }

        if (!/^[a-f0-9]{32}$/i.test(apiKey) || !/^\d{17}$/.test(steamId)) {
            showStatus('The saved Steam API key or SteamID64 has an invalid format.', 0);
            return;
        }

        try {
            const response = await requestOwnedGames(apiKey, steamId);
            const ownedTitles = new Set(response.games.map((game) => normalizeTitle(game.name)));

            console.info(`Steam Owned HumbleBundle Games: loaded ${response.game_count ?? response.games.length} games.`);
            startPageObserver(ownedTitles);
        } catch (error) {
            console.error('Steam Owned HumbleBundle Games:', error);
            showStatus(error instanceof Error ? error.message : 'Unable to load the Steam library.', 0);
        }
    };

    main();
})();
