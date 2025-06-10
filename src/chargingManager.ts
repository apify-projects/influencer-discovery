import { Actor } from 'apify';

await Actor.init();

export const chargingManager = Actor.getChargingManager();

export const CHARGE_EVENT_NAMES = {
    ACTOR_START: 'actor-start',
    PROFILE_OUTPUT: 'profile',
};
