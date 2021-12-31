Hooks.on("init", function () {
    game.socket.on("module.external-dice-roll-connector", (event) => {

        //Retrieve session id from the page cookie. This is needed to ensure that every player only parses their own rolls.
        for (let cookie of document.cookie.split('; ')) {
            const [name, value] = cookie.split("=");
            if (name === 'session') {
                this.sessionId = decodeURIComponent(value);
                break;
            }
        }

        //If the emission doesn't have the same session id as the FVTT session, this roll belongs to another user and won't be parsed.
        if (event.sessionId !== this.sessionId) {
            return;
        }

        switch (event.type) {
            case "roll": {
                try {
                    function findSpeaker(event) {
                        //If a character name was given, try to find a speaker with that name in this scene.
                        //Try to find one among the owned tokens first, then all actors.
                        //If neither are found, get the user's default speaker and change its alias to the name.
                        var mySpeaker;
                        var speakerTypeMessage;
                        if (event.name) {
                            var myToken = canvas.tokens.ownedTokens.find(t => t.name == event.name);
                            var myScene = game.scenes.get(game.user.viewedScene);
                            var myActor = game.actors.getName(event.name);
                            if (myToken) {
                                mySpeaker = ChatMessage.getSpeaker({ token: myToken });
                                speakerTypeMessage = "[External Dice Roll Connector] Owned token with name " + event.name + " found, using for chat message."
                            } else if (myScene && myActor) {
                                mySpeaker = ChatMessage.getSpeaker({ scene: myScene, actor: myActor });
                                speakerTypeMessage = "[External Dice Roll Connector] Actor with name " + event.name + " found, using for chat message."
                            } else {
                                mySpeaker = ChatMessage.getSpeaker({ user: game.user });
                                mySpeaker.alias = event.name;
                                speakerTypeMessage = "[External Dice Roll Connector] No token or actor with name " + event.name + " found, using player with alias for chat message."
                            }
                        }
                        //If no name is given, get the user's default speaker.
                        if (!mySpeaker) {
                            mySpeaker = ChatMessage.getSpeaker({ user: game.user })
                        }
                        console.log("[External Dice Roll Connector] Received external dice roll with alias " + event.name + ".");
                        console.log(speakerTypeMessage);
                        return mySpeaker;
                    }

                    //Check if this is a formula (string) or a Roll (object).
                    //A Roll will be converted into a real Roll object based on its formula, and then overwritten with the included data where possible.
                    if (event.roll instanceof Object) {
                        //Catch rolls that use "formula" or "total" as values instead of "_formula" and "_total".
                        if (event.roll.formula) {
                            event.roll._formula = event.roll.formula
                        }
                        if (event.roll.total) {
                            event.roll._total = event.roll.total;
                        }
                        var r = new Roll(event.roll._formula);
                        (async () => {
                            await r.evaluate({ async: true });
                            //Try to overwrite each attribute, starting with the terms; getters will be caught and ignored.
                            event.roll.terms?.forEach((term, index) => {
                                try {
                                    if (term instanceof Object && r.terms[index] instanceof Object) {
                                        event.roll.terms[index] = Object.assign(r.terms[index], term);
                                    } else {
                                        r.terms[index] = term;
                                    }
                                } catch { }
                            })
                            Object.keys(event.roll).forEach(key => {
                                try {
                                    if (r[key] instanceof Object) {
                                        r[key] = Object.assign(r[key], event.roll[key]);
                                    } else {
                                        r[key] = event.roll[key];
                                    }
                                } catch { }
                            })
                            const mySpeaker = findSpeaker(event);
                            //Finally, post the finished Roll into the chat.
                            r.toMessage({
                                speaker: mySpeaker
                            })
                        })();
                    } else {
                        var r = new Roll(event.roll.toString());
                        (async () => {
                            await r.evaluate({ async: true });
                            const mySpeaker = findSpeaker(event);
                            //Finally, post the finished Roll into the chat.
                            r.toMessage({
                                speaker: mySpeaker
                            })
                        })();
                    }
                } catch (error) {
                    ui.notifications.error("[External Dice Roll Connector] Error: " + error.toString());
                }
                break;
            }
        }
    });
});