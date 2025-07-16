const fetch = require('node-fetch');

exports.handler = async function (event, context) {
    const subscription = JSON.parse(event.body);

    const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
    const SUPABASE_API_KEY = 'YOUR_SERVICE_ROLE_KEY';

    const res = await fetch(`${SUPABASE_URL}/rest/v1/subscriptions`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_API_KEY,
            'Authorization': `Bearer ${SUPABASE_API_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({
            endpoint: subscription.endpoint,
            keys: subscription.keys
        })
    });

    const data = await res.json();

    return {
        statusCode: 200,
        body: JSON.stringify({ success: true, data })
    };
};