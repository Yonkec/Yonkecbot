//Sleeps the current execution for the indicated number of ms.
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//Generates a random value within a given range, inclusive
export function leetRoll(min, max) {
    //old approach that sucked and was suspiciously violating statistical probabilities
    //return value = Math.floor(Math.random() * (upper - lower + 1)) + lower;

    const range = max - min + 1;
    const bytesNeeded = Math.ceil(Math.log2(range) / 8);
    const randomBytes = crypto.randomBytes(bytesNeeded);
    const randomValue = randomBytes.readUIntBE(0, bytesNeeded);
    const result = min + (randomValue % range);
    return result;
}