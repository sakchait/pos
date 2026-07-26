// Services/ShiftSwapService.cs
namespace Pos.Infrastructure.Interfaces
{
    public interface IShiftSwapService
    {
        Task<bool> ApproveShiftSwapAsync(Guid swapRequestId, Guid managerId);
    }
}