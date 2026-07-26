// Services/ShiftGeneratorService.cs
namespace Pos.Infrastructure.Interfaces
{
    public interface IShiftGeneratorService
    {
        Task<bool> GenerateWeeklyScheduleAsync(Guid branchId, DateTime startDate, CancellationToken cancellationToken);
    }
}