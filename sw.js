self.addEventListener('push', function (event) {
    const data = event.data?.json() || {};
    event.waitUntil(
        self.registration.showNotification(data.title || "Hello!", {
            body: data.body || "You have a new notification!",
            icon: "/icon.png"
        })
    );
});