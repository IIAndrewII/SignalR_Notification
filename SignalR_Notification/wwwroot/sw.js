self.addEventListener('push', event => {
    console.log('Push event received:', event);

    const data = event.data ? event.data.json() : { title: "Default Title", body: "Default message" };

    self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icon.png'
    });
});


self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});
