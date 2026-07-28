// Application/DTOs/SyncOrderDto.cs
namespace Pos.Application.DTOs;

public record CreateOrderItemDto(
    string ProductId,
    decimal UnitPrice,
    int Quantity
);

public record CreateOrderDto(
    string Id, // GUID จาก Client PWA
    string OrderNo,
    string PosTerminalId,
    decimal TotalAmount,
    string PaymentMethod,
    DateTime CreatedAt,
    List<CreateOrderItemDto> Items
);

public record SyncResultDto(
    List<Guid> SyncedOrderIds,
    List<string> Errors
);