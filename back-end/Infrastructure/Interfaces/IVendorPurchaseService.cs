// Services/VendorPurchaseService.cs
namespace Pos.Infrastructure.Interfaces
{
    public interface IVendorPurchaseService
    {
        Task<bool> ApprovePoAndReceiveStockAsync(Guid poId, Guid purchaserUserId, CancellationToken cancellationToken);
    }
}