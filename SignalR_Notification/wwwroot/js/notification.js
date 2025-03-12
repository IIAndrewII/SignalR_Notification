const publicKey = 'BOsYqvuH61SyKl7X9s7KTRzAkAVEfFmRuHbNEWgAL614P7CZU66GbY-vsuqVgODtNH7H5nEa4_bot-5j1NdE36M';

if (Notification.permission === "default") {
    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            console.log("Notification permission granted");
        } else {
            console.warn("Notification permission denied");
        }
    });
}


// Convert Base64 string to a Uint8Array (Web Push requires this format)
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}
async function sendPushNotification(message) {
    try {
        const response = await fetch('/api/push/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(message)
        });

        if (response.ok) {
            console.log('Push notification sent successfully');
        } else {
            console.error('Failed to send push notification');
        }
    } catch (error) {
        console.error('Error sending push notification:', error);
    }
}

async function subscribeToPush() {
    try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log("Service Worker registered:", registration);

        const readyRegistration = await navigator.serviceWorker.ready;

        // Convert the public key to a format the Push API expects
        const applicationServerKey = urlBase64ToUint8Array(publicKey);

        const subscription = await readyRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey
        });

        console.log("Push subscription:", subscription);

        await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscription)
        });

        alert('Subscribed to push notifications!');
    } catch (error) {
        console.error("Failed to subscribe to push:", error);
        alert("Push subscription failed. Check console for details.");
    }
}
