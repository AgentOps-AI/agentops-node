import axios from 'axios';
import { transformKeysToSnakeCase } from "./helpers";
import { Session } from './session';
import {Event} from './event'

const RETRY_LIMIT = 5;

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function post(url: string, payload: any, apiKey: string, orgKey?: string) {
    for (let i = 0; i < RETRY_LIMIT; i++) {
        try {
            return axios.post(url, payload, {
                headers: {
                    "X-Agentops-Auth": apiKey,
                    "X-Agentops-Org": orgKey,
                    "Content-Type": "application/json; charset=UTF-8",
                    "Accept": "*/*"
                }
            });
        } catch (err) {
            if (i === RETRY_LIMIT - 1) throw err;
            await sleep(Math.pow(2, i) * 1000)
        }
    }
}


export async function postEvents(endpoint: string, events: Event[], apiKey: string, orgKey?: string) {
    const payload = {
        events: transformKeysToSnakeCase(events)
    }
    return post(`${endpoint}/events`, payload, apiKey, orgKey);
}

export async function postSession(endpoint: string, session: Session, apiKey: string, orgKey?: string) {
    const payload = {
        session: transformKeysToSnakeCase(session)
    }
    return post(`${endpoint}/sessions`, payload, apiKey, orgKey);
}