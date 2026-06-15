import Razorpay from 'razorpay'

// Lazy getter: creates the Razorpay instance on first use so that
// environment variables are guaranteed to be loaded via dotenv before
// the constructor runs (avoids "key_id is mandatory" error on boot).
let _razorpayInstance = null;

export const getRazorpay = () => {
    if (_razorpayInstance) return _razorpayInstance;

    const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
        throw new Error('Razorpay credentials missing. Set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file.');
    }

    _razorpayInstance = new Razorpay({ key_id, key_secret });
    return _razorpayInstance;
};

// Keep backward-compatible named export (uses lazy getter)
export const razorpay = new Proxy({}, {
    get(_, prop) {
        return getRazorpay()[prop];
    }
});