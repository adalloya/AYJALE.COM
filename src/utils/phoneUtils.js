/**
 * Formats a Mexican phone number (10 digits) cleanly without parentheses.
 * Automatically adapts between 2-digit LADA (55/56 CDMX, 33 GDL, 81 MTY) -> XX XXXX XXXX
 * and 3-digit LADA (all other Mexican cities) -> XXX XXX XXXX.
 */
export const formatPhoneNumber = (val) => {
    if (!val) return '';
    let digits = String(val).replace(/\D/g, '');
    if (digits.startsWith('52') && digits.length >= 12) {
        digits = digits.slice(2);
    }
    digits = digits.slice(0, 10);
    if (!digits) return '';

    const isTwoDigitLada = /^(55|56|33|81)/.test(digits);
    if (isTwoDigitLada) {
        if (digits.length <= 2) return digits;
        if (digits.length <= 6) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
        return `${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`;
    } else {
        if (digits.length <= 3) return digits;
        if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
        return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }
};
