export interface Session {
    sessionId: string;
    endState: "Success" | "Fail" | "Indeterminate";
    tags: string[];
    rating: string;
    endTimestamp: string;
    initTimestamp: string;
}

export class Session implements Session {
    constructor(id: Session['sessionId'], tags?: Session['tags']) {
        this.sessionId = id;
        this.tags = tags || [];
        this.initTimestamp = new Date().toISOString();
    }

    endSession(endState: Session["endState"], rating?: Session["rating"]) {
        this.endState = endState;
        this.rating = rating || "";
        this.endTimestamp = new Date().toISOString();
    }

    hasEnded() {
        return this.endState ? true : false;
    }
}