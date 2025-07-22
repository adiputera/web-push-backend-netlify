const webpush = require("web-push");
const verifyToken = require('../utils/jwtUtils');

exports.handler = async function (event, context) {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: "Method Not Allowed" }),
        };
    }

    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        const verified = verifyToken(token);
        if (!verified) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: "Unauthorized" }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }
    }

    const { subscription, title, body, image, url, actions } = JSON.parse(event.body || "{}");

    if (!subscription || !title || !body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Missing required fields" }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }

    const VAPID_PUBLIC_KEY = process.env.PUBLIC_VAPID_KEY;
    const VAPID_PRIVATE_KEY = process.env.PRIVATE_VAPID_KEY;

    webpush.setVapidDetails(
        "mailto:yusuf@adiputera.id",
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
    );

    const payload = JSON.stringify({ title, body, image, url, actions });

    try {
        await webpush.sendNotification(subscription, payload, { TTL: 86400 });
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Notification sent" }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error sending notification", error }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
}