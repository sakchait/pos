namespace Pos.Domain.Entities;

public class PublicHoliday
{
    public Guid Id { get; set; }
    public DateTime HolidayDate { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal PayMultiplier { get; set; } = 2.0m;
}