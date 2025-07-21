const webpush = require("web-push");

exports.handler = async function (event, context) {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: "Method Not Allowed" }),
        };
    }

    const { subscription, title, body, image } = JSON.parse(event.body || "{}");

    if (!subscription || !title || !body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Missing required fields" }),
        };
    }

    const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
    const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

    webpush.setVapidDetails(
        "mailto:example@example.com",
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
    );

    const payload = JSON.stringify({ title, body, image });

    try {
        await webpush.sendNotification(subscription, payload, { TTL: 86400 });
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Notification sent" }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error sending notification", error }),
        };
    }
};