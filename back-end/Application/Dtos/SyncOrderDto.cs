// Application/DTOs/SyncOrderDto.cs
namespace Pos.Application.DTOs;

public record CreateOrderItemDto(
    Guid ProductId,
    decimal UnitPrice,
    int Quantity
);

public record CreateOrderDto(
    Guid Id, // GUID จาก Client PWA
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