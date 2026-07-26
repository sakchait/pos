namespace Pos.Domain.Entities;

public class Attendance
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public DateTime ClockIn { get; set; }
    public DateTime? ClockOut { get; set; }

    public User? User { get; set; }
}
