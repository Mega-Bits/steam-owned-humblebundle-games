// ==UserScript==
// @name         Steam Owned HumbleBundle Games
// @namespace    kevinbatdorf
// @version      0.1
// @description  Will check whether you own the Humble Bundle game in your Steam library already
// @author       You
// @match        https://www.humblebundle.com/*
// @icon         https://www.google.com/s2/favicons?domain=humblebundle.com
// @grant        none
// ==/UserScript==

// Follow me! https://twitter.com/kevinbatdorf

// Requires Tampermonkey
// Chrome - https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en
// FF - https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/

(function() {
    'use strict';

    // TODO: Could expand this to get more info from Steam, such as ratings.

    // https://steamcommunity.com/dev
    const steamApiKey = '';

    // https://store.steampowered.com/account/
    const steamId = '';

    // Choose your style to add to the parent box.
    const styling = 'box-shadow:0 0 5px 5px #c368ff';
    const ownedStyles = 'display:block;margin:-0.25rem 0 1rem;padding-top:0;color:rgb(195 104 255)';

    // Remove special characters.
    const normalizeText = (str) => {
        return str.toLowerCase().replace(/[^a-zA-Z ]/g, '');
    };

    // Check whether this page contains games.
    let humbleGames = [];
    try {
        humbleGames = Array.from(document.querySelectorAll('.content-choice-title, .tier-item-view .item-title'));
    } catch (error) {
        console.error('Error', error);
    }
    if (!humbleGames || !humbleGames.length) return;

    console.info(`Found ${humbleGames.length} games on this page`);

    fetch(`https://test.cors.workers.dev/?https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${steamApiKey}&steamid=${steamId}&format=json&include_appinfo=1`)
        .then((response) => response.json())
        .then(({ response }) => {
            console.info(`You have ${response.game_count} Steam games`);

            const games = response.games.map((game) => normalizeText(game.name));
            const owned = humbleGames.filter((game) => games.includes(normalizeText(game.innerText)));

            owned.forEach((node) => {
                node.insertAdjacentHTML('afterend', `<strong class="content-choice-title" style="${ownedStyles}">owned</strong>`);

                if (node.closest('.js-item-details')) {
                    node.closest('.js-item-details').querySelector('.img-container').style.cssText += styling;
                }

                if (node.closest('.content-choice')) {
                    node.closest('.content-choice').style.cssText += styling;
                }
            });
        })
        .catch((error) => console.error('Unable to load Steam library', error));
})();
