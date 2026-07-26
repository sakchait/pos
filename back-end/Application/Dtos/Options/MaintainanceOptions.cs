namespace Application.Dtos.Options;

public class MaintainanceOptions
{
    // "HH:mm" 24h format in HKT (UTC+8)
    public string? FromTime { get; set; }
    public string? ToTime { get; set; }
    // Day abbreviation: Mon,Tue,Wed,Thu,Fri,Sat,Sun or "*" for every day
    public string? Day { get; set; }
    public bool Active { get; set; }
}