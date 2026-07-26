// Services/FifoCostingService.cs
namespace Pos.Infrastructure.Interfaces
{
    public interface IFifoCostingService
    {
        Task<decimal> DeductFifoStockAndCalculateCogsAsync(Guid warehouseId, Guid productId, int quantityToDeduct);
    }
}