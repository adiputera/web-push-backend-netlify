const webpush = require("web-push");
const fetch = require("node-fetch");

exports.handler = async function (event, context) {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: "Method Not Allowed" }),
        };
    }

    const { title, body, image, url, actions } = JSON.parse(event.body || "{}");

    if (!title || !body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Missing title or body" }),
        };
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_API_KEY = process.env.SUPABASE_KEY;
    const VAPID_PUBLIC_KEY = process.env.PUBLIC_VAPID_KEY;
    const VAPID_PRIVATE_KEY = process.env.PRIVATE_VAPID_KEY;

    webpush.setVapidDetails(
        "mailto:yusuf@adiputera.id",
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
    );

    const response = await fetch(`${SUPABASE_URL}/rest/v1/subscriptions`, {
        headers: {
            apikey: SUPABASE_API_KEY,
            Authorization: `Bearer ${SUPABASE_API_KEY}`,
        },
    });

    const subscriptions = await response.json();

    const payload = JSON.stringify({
        title,
        body,
        image,
        actions,
        data: { url }
    });


    const results = await Promise.allSettled(subscriptions.map(sub =>
        webpush.sendNotification(sub, payload, { TTL: 86400 })
            .then(() => ({ success: true }))
            .catch(error => ({ success: false, error: error.message }))
    ));

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Notifications sent",
            results,
        }),
        headers: {
            'Content-Type': 'application/json'
        },
    };
};