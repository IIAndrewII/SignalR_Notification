using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using SignalRWebPushApp.Models;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using WebPush;
using PushSubscription = SignalRWebPushApp.Models.PushSubscription;  // Alias for your custom model

namespace SignalRWebPushApp.Controllers
{
    [ApiController]
    [Route("api/push")]
    public class PushController : ControllerBase
    {
        private static List<PushSubscription> _subscriptions = new();
        private readonly string _vapidPublicKey;
        private readonly string _vapidPrivateKey;
        private readonly string _subject = "mailto:your-email@example.com";

        public PushController(IConfiguration configuration)
        {
            _vapidPublicKey = configuration["VapidKeys:PublicKey"];
            _vapidPrivateKey = configuration["VapidKeys:PrivateKey"];
        }

        [HttpPost("subscribe")]
        public IActionResult Subscribe([FromBody] PushSubscription subscription)
        {
            if (!_subscriptions.Contains(subscription))
            {
                _subscriptions.Add(subscription);
            }
            return Ok("Subscribed!");
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendPushNotification([FromBody] string message)
        {
            var vapidDetails = new VapidDetails(_subject, _vapidPublicKey, _vapidPrivateKey);
            var webPushClient = new WebPushClient();

            var payload = JsonSerializer.Serialize(new
            {
                title = "New Notification!",
                body = message
            });

            foreach (var subscription in _subscriptions)
            {
                try
                {
                    var pushSubscription = new WebPush.PushSubscription(
                        subscription.Endpoint,
                        subscription.Keys.P256dh,
                        subscription.Keys.Auth);

                    await webPushClient.SendNotificationAsync(pushSubscription, payload, vapidDetails);
                }
                catch (WebPushException ex)
                {
                    Console.WriteLine($"Failed to send push notification: {ex.Message}");
                }
            }

            return Ok("Notifications sent");
        }
    }
}

