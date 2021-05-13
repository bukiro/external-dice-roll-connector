class APIModule {
    constructor() {
        this.sessionId = null;
        this.socket = null;
        // Get the userId if logged in
        for (let cookie of document.cookie.split('; ')) {
            const [name, value] = cookie.split("=");
            if (name === 'session') {
                this.sessionId = decodeURIComponent(value);
                break;
            }
        }
        // Connect to the game socket, passing the userId as an initial data packet
        this.socket = io.connect(window.location.origin, {
            'reconnection': false,
            query: { session: this.sessionId }
        });
    }

    error(message) {
        this.reply({success: false, error: message});
    }

    reply(result) {
        const body = document.getElementsByTagName("body")[0];
        body.textContent = JSON.stringify(result);
    }
    
    processRequest() {
        if (!this.sessionId)
            return this.error("User not logged in")
        let params = {};
        try {
            let search = window.location.search;
            if (search[0] === '?')
                search = search.slice(1);
            for (let query of search.split("&")) {
                let [key, value] = query.split("=");
                value = decodeURIComponent(value);
                try {
                    params[key] = JSON.parse(value);
                } catch (err) {
                    params[key] = value;
                }
            }
        } catch (err) {
            return this.error("Error parsing query string")
        }

        if (!params.roll) {
            return this.error("Parameter roll was not given")
        }

        console.log(params.roll)
        this.socket.emit("module.external-dice-roll-connector", { type: "roll", sessionId: this.sessionId, roll: params.roll })
            
        this.reply({message: "Roll sent: " + params.roll})
    }
}

api = new APIModule();
window.addEventListener("DOMContentLoaded", () => api.processRequest());