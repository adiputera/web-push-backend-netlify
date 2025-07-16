const fetch = require('node-fetch');
const webpush = require('web-push');

exports.handler = async function (event, context) {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_API_KEY = process.env.SUPABASE_KEY;
    const VAPID_PUBLIC_KEY = process.env.PUBLIC_VAPID_KEY;
    const VAPID_PRIVATE_KEY = process.env.PRIVATE_VAPID_KEY;

    webpush.setVapidDetails(
        'mailto:yusuf@adiputeral.id',
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
    );

    const response = await fetch(`${SUPABASE_URL}/rest/v1/subscriptions`, {
        headers: {
            'apikey': SUPABASE_API_KEY,
            'Authorization': `Bearer ${SUPABASE_API_KEY}`,
            'Content-Type': 'application/json'
        }
    });

    const subscriptions = await response.json();

    const payload = JSON.stringify({
        title: "Hello from Netlify!",
        body: "This is a blast notification to all subscribers."
    });

    const results = await Promise.allSettled(subscriptions.map(sub =>
        webpush.sendNotification(sub, payload)
            .then(() => ({ success: true }))
            .catch(error => ({ success: false, error: error.message }))
    ));

    return {
        statusCode: 200,
        body: JSON.stringify({ results })
    };
};