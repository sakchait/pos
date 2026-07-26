namespace Pos.Domain.Entities;

public class LeaveRequest
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string LeaveType { get; set; } = "SickLeave"; // SickLeave, PersonalLeave, AnnualLeave
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? Reason { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
    public Guid? ApprovedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
}
