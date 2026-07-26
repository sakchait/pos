namespace Presentation.Api.Authorization
{
    public sealed class ApiKeySettings
    {
        public List<ApiKeyEntry> Keys { get; init; } = [];
    }

    public sealed class ApiKeyEntry
    {
        public string Key { get; init; } = string.Empty;
        public DateTime ExpiresAt { get; init; }
        public string Description { get; init; } = string.Empty;
    }
}