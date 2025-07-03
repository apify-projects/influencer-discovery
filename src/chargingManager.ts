import { Actor, type ChargeOptions } from 'apify';

export const chargeEvent = async (options: ChargeOptions) => {
    await Actor.charge(options);
};

export const CHARGE_EVENT_NAMES = {
    PROFILE_OUTPUT: 'profile',
};
