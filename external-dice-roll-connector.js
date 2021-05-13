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
                //Check if this is a formula or a Roll.
                //A Roll will be converted into a real Roll object based on its formula, and then overwritten with its attributes where possible.
                //A Roll Object has getter functions and can't be assigned in one go.
                if (event.roll.class === "Roll") {
                    r = new Roll(event.roll.formula);
                    r.evaluate();
                    //Overwrite each attribute that isn't a getter.
                    Object.keys(event.roll).forEach(key => {
                        try {
                            r[key] = event.roll[key];
                        } catch { }
                    })
                    //Now turn every term with class === "Die" into a real Die object.
                    if (event.roll.terms) {
                        r.terms = event.roll.terms.map(term => term.class === "Die" ? Object.assign(new Die(), term) : term);
                    }
                    //If the fake Roll has a total value, apply it to the real Roll's _total (as total is a getter function.)
                    if (event.roll.total) {
                        r._total = event.roll.total;
                    }
                } else {
                    r = new Roll(event.roll.toString());
                    r.evaluate();
                }
                //Finally, post the finished Roll into the chat.
                r.toMessage({
                    user: game.user._id,
                })
                break;
            }
        }
    });
});