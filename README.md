# VAPID Web Push Backend Using Netlify Functions
This project implements a backend for VAPID Web Push notifications using Netlify Functions. It allows you to send push notifications to subscribed clients from your serverless backend. Currently it only supports VAPID-based web push notification, so iOS devices is out of order.

## Dependencies
- [node-jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- [web-push](https://github.com/web-push-libs/web-push)
- [node-fetch](https://github.com/node-fetch/node-fetch)

## Features
- Serverless backend using Netlify Functions
- Handles push subscription and notification sending
- Uses [web-push](https://github.com/web-push-libs/web-push) library for VAPID and payload encryption
- Example endpoints for subscribing and sending notifications

## Getting Started

### Prerequisites
- Node.js > 18
- Netlify CLI (`npm install -g netlify-cli`)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/netlify-webpush.git
   cd netlify-webpush
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Add your VAPID keys and other configuration as needed to .env file.

### Running Locally
Start the Netlify Functions server locally:
```bash
netlify dev
```

### Deploying
Deploy to Netlify using the CLI or by connecting your repository to Netlify.

## API Endpoints
- `POST /api/subscribe`  
  Save a user's push subscription.

- `POST /api/auth`  
  Get a token, used for sending push notification.

- `POST /api/blast`  
  Send a push notification to all subscribers.

- `POST /api/push-notification`  
  Send a push notification to single subscriber.

## Usage
- Create a database & table in Supabase, with column:

    | Column Name | Type      |
    |-------------|-----------|
    | id          | uuid      |
    | created_at  | timestamp |
    | endpoint    | text      |
    | keys        | json      |

- Example script on how to subscribe to notification for the front-end:
    ```JavaScript
    const vapidPublicKey = "YOUR_VAPID_PUBLIC_KEY";

    function askNotificationPermission() {
        if (!("Notification" in window)) {
            console.error("Notifications not supported in this browser");
            return;
        }

        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                navigator.serviceWorker.getRegistration().then(registration => {
                    if (!registration) {
                        return navigator.serviceWorker.register("/sw.js");
                    }
                    return registration;
                }).then(registration => {
                    if (!registration) {
                        console.error("Service Worker registration failed.");
                        return;
                    }
                    registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
                    }).then(subscription => {
                        if (!subscription) {
                            console.error("Failed to subscribe to push notifications.");
                            return;
                        }
                        fetch('/api/subscribe', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(subscription)
                        });
                    }).catch(error => {
                        console.error("Failed to subscribe:", error);
                    });
                }).catch(error => {
                    console.error("Service Worker registration not found:", error);
                });
            } else if (permission === "denied" || permission === "default") {
                console.warn("Notification permission denied or defaulted.");
            }
        });
    }

    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const raw = atob(base64);
        return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
    }
    ```

- Example service worker on how to handle push notification & notification click:
    ```JavaScript
    self.addEventListener('push', function (event) {
        let data = {
            title: "Hello!",
            body: "You have a new notification!",
            icon: "",
            image: "",
            badge: "",
            data: {},
            actions: []
        };

        if (event.data) {
            try {
                const json = event.data.json();
                data = { ...data, ...json };
            } catch (e) {
                console.warn("Push data is not valid JSON, using as text:", e);
                data.body = event.data.text();
            }
        }

        event.waitUntil(
            self.registration.showNotification(data.title, {
                body: data.body,
                icon: data.icon,
                image: data.image,
                badge: data.badge,
                data: data.data,
                actions: data.actions
            })
        );
    });

    self.addEventListener('notificationclick', function (event) {
        event.notification.close();

        const url = event.notification.data?.url;

        if (event.action === 'dismiss') {
            return;
        }

        if ((!event.action || event.action === 'open_url') && url) {
            event.waitUntil(clients.openWindow(url));
        }
    });
    ```

- Example on how to get token:
    - Add client to environment variables (.env file on local). It should be `CLIENT_${CLIENT_ID}=${SECRET}`.

        So if you want the client id to be `function` and secret to be `asdqwe123`, then you need to add `CLIENT_FUNCTION=asdqwe123`. Please note there should be `CLIENT_` prefix before the actual client ID.
    - To get the token, send [POST] to `/api/auth`
        ```
        curl --location --request POST '{baseUrl}/api/auth' \
            --header 'Authorization: Basic base64(${clientId}:${clientSecret})'
        ```

- Example on how to blast messsage to all subscribers:
    Send [POST] to `/api/blast`, with payload (don't forget the bearer token)
    ```JSON
    {
        "title": "Some Title",
        "body": "Some body",
        "image": "/image.jpg",
        "url": "https://example.com",
        "actions": [
            {
                "action": "open_url",
                "title": "Open"
            },
            {
                "action": "dismiss",
                "title": "Dismiss"
            }
        ]
    }
    ```

- Example on how to send push notification to single subscriber:
    Send [POST] to `/api/push-notification`, with payload (don't forget the bearer token).
    To get the subscription object, you can check the database
    ```JSON
    {
        "title": "Some Title",
        "body": "Some body",
        "url": "https://example.com",
        "actions": [
            {
                "action": "open_url",
                "title": "Open"
            },
            {
                "action": "dismiss",
                "title": "Dismiss"
            }
        ],
        "subscription": {
            "endpoint": "https://the-subscription-endpoint",
            "keys": {
                "p256dh": "p256dh keys",
                "auth": "auth keys"
            }
        }
    }
    ```

## Contributing
Contributions are welcome! Please submit a pull request or open an issue to discuss any changes.
