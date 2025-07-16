const fetch = require('node-fetch');
const webpush = require('web-push');

exports.handler = async function (event, context) {
    const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
    const SUPABASE_API_KEY = 'YOUR_SERVICE_ROLE_KEY';
    const VAPID_PUBLIC_KEY = 'YOUR_PUBLIC_VAPID_KEY';
    const VAPID_PRIVATE_KEY = 'YOUR_PRIVATE_VAPID_KEY';

    webpush.setVapidDetails(
        'mailto:example@example.com',
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