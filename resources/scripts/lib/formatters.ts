const _CONVERSION_UNIT = 1024;

/**
 * Given a value in megabytes converts it back down into bytes.
 */
function mbToBytes(megabytes: number): number {
    return Math.floor(megabytes * _CONVERSION_UNIT * _CONVERSION_UNIT);
}

/**
 * Given an amount of bytes, converts them into a human readable string format
 * using "1024" as the divisor.
 */
function bytesToString(bytes: number, decimals = 2): string {
    const k = _CONVERSION_UNIT;

    if (bytes < 1) return '0 Bytes';

    decimals = Math.floor(Math.max(0, decimals));
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = Number((bytes / Math.pow(k, i)).toFixed(decimals));

    return `${value} ${['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'][i]}`;
}

/**
 * Formats an IPv4 or IPv6 address.
 */
function ip(value: string): string {
    // IPv6 text is at most 45 characters. Keeping the expression to a single,
    // bounded character class avoids backtracking on attacker-controlled input.
    const isIpv6 = value.length <= 45 && value.includes(':') && /^[a-f0-9:.]+$/i.test(value);

    return isIpv6 ? `[${value}]` : value;
}

export { ip, mbToBytes, bytesToString };
