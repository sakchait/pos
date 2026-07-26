using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Options;

namespace Presentation.Api.Authorization
{
    public sealed class ApiKeyFilter : IAuthorizationFilter
    {
        private const string ApiKeyHeaderName = "x-functions-key";
        private readonly ApiKeySettings _settings;
        private readonly ILogger<ApiKeyFilter> _logger;

        public ApiKeyFilter(IOptions<ApiKeySettings> settings, ILogger<ApiKeyFilter> logger)
        {
            _settings = settings.Value;
            _logger = logger;
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var hasApiKeyAttribute = context.ActionDescriptor.EndpointMetadata
                .OfType<ApiKeyAttribute>()
                .Any();

            if (!hasApiKeyAttribute)
                return;

            if (!context.HttpContext.Request.Headers.TryGetValue(ApiKeyHeaderName, out var receivedKey))
            {
                context.Result = new UnauthorizedObjectResult(new { message = "Missing API key." });
                return;
            }

            var now = DateTime.UtcNow;

            var matchedKey = _settings.Keys.FirstOrDefault(k =>
                string.Equals(k.Key, receivedKey, StringComparison.Ordinal) &&
                k.ExpiresAt > now);

            if (matchedKey is null)
            {
                _logger.LogWarning("Unauthorized API access attempt at {Time}.", now);
                context.Result = new UnauthorizedObjectResult(new { message = "Invalid or expired API key." });
                return;
            }

            // Warn when key is within 14 days of expiry
            var daysUntilExpiry = (matchedKey.ExpiresAt - now).TotalDays;
            if (daysUntilExpiry <= 14)
            {
                _logger.LogWarning(
                    "API key '{Description}' expires in {Days:F0} day(s) on {ExpiresAt:yyyy-MM-dd}. Schedule rotation.",
                    matchedKey.Description,
                    daysUntilExpiry,
                    matchedKey.ExpiresAt);
            }
        }
    }
}