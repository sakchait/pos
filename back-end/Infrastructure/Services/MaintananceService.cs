using System.Globalization;
using Application.Dtos.Options;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Pos.Infrastructure.Interfaces;

namespace Infrastructure.Services;

public class MaintananceService : IMaintananceService
{
    private readonly ILogger<MaintananceService> _logger;
    private readonly List<MaintainanceOptions> _windows = new();
    private readonly TimeZoneInfo _hktTimeZone;
    private readonly Dictionary<string, DayOfWeek> _dayMap = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Mon"] = DayOfWeek.Monday,
        ["Tue"] = DayOfWeek.Tuesday,
        ["Wed"] = DayOfWeek.Wednesday,
        ["Thu"] = DayOfWeek.Thursday,
        ["Fri"] = DayOfWeek.Friday,
        ["Sat"] = DayOfWeek.Saturday,
        ["Sun"] = DayOfWeek.Sunday
    };

    public MaintananceService(IConfiguration config, ILogger<MaintananceService> logger)
    {
        _logger = logger;

        // Load maintenance windows from configuration
        var section = config.GetSection("MaintainanceOptions");
        var items = section.Get<List<MaintainanceOptions>>() ?? new List<MaintainanceOptions>();
        _windows = items.Where(w => w.Active).ToList();

        _hktTimeZone = ResolveHongKongTimeZone();
    }

    public bool IsMaintanance()
    {
        if (_windows.Count == 0)
        {
            return false;
        }

        var nowUtc = DateTime.UtcNow;
        var nowHkt = TimeZoneInfo.ConvertTimeFromUtc(nowUtc, _hktTimeZone);
        var currentDay = nowHkt.DayOfWeek;
        var currentTime = nowHkt.TimeOfDay;

        foreach (var window in _windows)
        {
            if (string.IsNullOrWhiteSpace(window.FromTime) || string.IsNullOrWhiteSpace(window.ToTime))
                continue;

            if (!TryParseTime(window.FromTime, out var from) || !TryParseTime(window.ToTime, out var to))
                continue;

            var dayMatches = window.Day == "*" ||
                             (window.Day != null &&
                              _dayMap.TryGetValue(window.Day, out var configuredDay) &&
                              configuredDay == currentDay);

            if (!dayMatches)
                continue;

            // Inclusive start, exclusive end
            if (currentTime >= from && currentTime < to)
            {
                _logger.LogInformation("Maintenance window matched (Day={Day}, From={From}, To={To}, Now(HKT)={Now})",
                    window.Day, window.FromTime, window.ToTime, nowHkt.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture));
                return true;
            }
        }

        return false;
    }

    private static bool TryParseTime(string value, out TimeSpan time)
    {
        return TimeSpan.TryParseExact(value, "hh\\:mm", CultureInfo.InvariantCulture, out time)
               || TimeSpan.TryParseExact(value, "h\\:mm", CultureInfo.InvariantCulture, out time);
    }

    private static TimeZoneInfo ResolveHongKongTimeZone()
    {
        // Windows: "China Standard Time"; Linux: "Asia/Hong_Kong"
        string[] ids = { "Asia/Hong_Kong", "Hongkong", "China Standard Time" };
        foreach (var id in ids)
        {
            try
            {
                return TimeZoneInfo.FindSystemTimeZoneById(id);
            }
            catch { /* ignore */ }
        }
        // Fallback fixed offset UTC+8 (no DST)
        return TimeZoneInfo.CreateCustomTimeZone("HKT_Fallback", TimeSpan.FromHours(8), "HKT_Fallback", "HKT_Fallback");
    }
}