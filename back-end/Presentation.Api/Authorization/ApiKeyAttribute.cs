namespace Presentation.Api.Authorization
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public sealed class ApiKeyAttribute : Attribute
    {
    }
}