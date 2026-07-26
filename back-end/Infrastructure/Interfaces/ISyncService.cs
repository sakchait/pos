// Application/Interfaces/ISyncService.cs
using Pos.Application.DTOs;

namespace Pos.Infrastructure.Interfaces;

public interface ISyncService
{
    Task<SyncResultDto> ProcessOfflineOrdersAsync(List<CreateOrderDto> offlineOrders,CancellationToken cancellationToken = default);
}