const fetch = require('node-fetch');

exports.handler = async function (event, context) {
    const allowedOrigins = [
        'http://localhost:8080',
        'https://adiputera.github.io'
    ];

    const origin = event.headers.origin || '';
    const isAllowed = allowedOrigins.includes(origin);

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers: {
                ...(isAllowed && {
                    'Access-Control-Allow-Origin': origin,
                    'Vary': 'Origin',
                }),
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            },
        };
    }

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: "Method Not Allowed" }),
        };
    }
    const subscription = JSON.parse(event.body);

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_API_KEY = process.env.SUPABASE_KEY;

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
        headers: {
            'Content-Type': 'application/json',
            ...(isAllowed && {
                'Access-Control-Allow-Origin': origin,
                'Vary': 'Origin',
            }),
        },
        body: JSON.stringify({ success: true, data })
    };
};
