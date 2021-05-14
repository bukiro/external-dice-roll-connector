# External Dice Roll Connector

This module allows you to roll dice in your open Foundry VTT session from your web browser.

# Usage

After the module is installed on the Foundry VTT server and enabled for the current world, you can send a dice roll to the server. You need to already be logged in to a FVTT session.

Access the connector via your FVTT URL under the path `/modules/external-dice-roll-connector/roll.html` and add the query `roll` with your desired roll. Optionally, add the query `name` to provide the character name that should be appended to the roll message.

The connector can parse Foundry dice rolling formulas (such as `2d6 + 2`), or you can calculate the results in your own app and send a finished Roll object.

- Formula: Simply add your formula after `roll.html?roll=`.

- Roll: You should only send a completed Roll if you have calculated the result in your own app and don't want it calculated again in the session. See the [Foundry VTT API documentation](https://foundryvtt.com/api/) on how to structure a Roll object. Your Roll object should have at least the following attributes:

    - `class: "Roll"`
    - `formula`
    - `terms`
    - `results`
    - `_total` (with the underscore - not `total`)

# Examples

- Formula: `http://your.server:port/modules/external-dice-roll-connector/roll.html?roll=2d6+2`

- Formula: `http://your.server:port/modules/external-dice-roll-connector/roll.html?roll=15&name=Heroguy`

- Roll: `http://your.server:port/modules/external-dice-roll-connector/roll.html?name=Heroguy&roll={"class":"Roll","formula":"2d6 + 2","terms":[{"class":"Die","number":2,"faces":6,"results":[{"result":5,"active":true},{"result":4,"active":true}]},"+",2],"results":[9,"+",2],"_total":11}`
    - This represents a roll of `2d6 + 2`, calculated to `5 + 4 + 2 = 11` - rolled by our hero, Heroguy.
    - The corresponding in-app JSON of the roll would look like this:

```
{
    class: "Roll",
    formula: "2d6 + 2",
    terms: [
        {
            class: "Die",
            number: 2,
            faces: 6,
            results: [
                {
                    result: 5,
                    active: true
                },
                {
                    result: 4,
                    active: true
                }
            ]
        },
        "+",
        2
    ],
    results: [
        9,
        "+",
        2
    ],
    _total: 11
}
```

# Installation

Install the module from the library or by the manifest URL: `https://raw.githubusercontent.com/bukiro/external-dice-roll-connector/master/module.json`

Enable the module for any world in which you want to use it.

# License

This Foundry VTT module is based on the [HTTP API module by KaKaRoTo](https://foundryvtt.com/packages/api/).

This Foundry VTT module is licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).
