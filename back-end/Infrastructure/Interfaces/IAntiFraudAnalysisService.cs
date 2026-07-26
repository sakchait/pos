// Services/AntiFraudAnalysisService.cs
namespace Pos.Infrastructure.Interfaces
{
    public interface IAntiFraudAnalysisService
    {
        Task CheckCashierAnomaliesAsync(Guid cashierId, Guid shiftId);
    }
}