using System;
using System.Security.Cryptography;
using System.Text;

namespace Pos.Domain.Security;

public static class HmacSecurity
{
    private const string SecretKey = "OmniPOS_Enterprise_AntiTamper_Key_2026";

    public static string ComputeAuditLogSignature(string logId, string userId, string action, string description, string createdAt)
    {
        var dataToSign = $"{logId}:{userId}:{action}:{description}:{createdAt}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(SecretKey));
        var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(dataToSign));
        return Convert.ToHexString(hashBytes).ToLower();
    }
}
