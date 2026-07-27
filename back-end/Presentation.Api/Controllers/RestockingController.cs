using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pos.Application.Repositories;
using Pos.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Presentation.Api.Authorization;

namespace Pos.Api.Controllers;

[ApiController]
[ApiKey]
public class RestockingController : ControllerBase
{
    private readonly IRepository<PurchaseOrder> _poRepo;
    private readonly IRepository<StockBatch> _batchRepo;
    private readonly IRepository<Product> _productRepo;

    public RestockingController(
        IRepository<PurchaseOrder> poRepo,
        IRepository<StockBatch> batchRepo,
        IRepository<Product> productRepo)
    {
        _poRepo = poRepo;
        _batchRepo = batchRepo;
        _productRepo = productRepo;
    }

    // 1. GET /api/proposed-pos - Gets all proposed purchase orders mapped to frontend DTO
    [HttpGet("/api/proposed-pos")]
    public async Task<IActionResult> GetProposedPOs(CancellationToken cancellationToken)
    {
        var list = await _poRepo.GetAll()
            .Include(p => p.Vendor)
            .Include(p => p.Items)
            .ThenInclude(i => i.Product)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var result = list.Select(po => new
        {
            id = po.Id.ToString(),
            poNumber = po.PoNumber,
            vendorId = po.VendorId.ToString(),
            vendorName = po.Vendor?.Name ?? "Unknown Vendor",
            items = po.Items.Select(i => new
            {
                productId = i.ProductId.ToString(),
                productName = i.Product?.Name ?? "Unknown Product",
                quantity = i.Quantity,
                price = (double)i.UnitPrice
            }).ToList(),
            totalAmount = (double)po.TotalAmount,
            status = po.Status.ToUpperInvariant(), // PROPOSED, APPROVED, REJECTED
            createdAt = po.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")
        }).ToList();

        return Ok(result);
    }

    // 2. POST /api/proposed-pos - Submits a new restocking PO
    public record AddPoItemRequest(string ProductId, int Quantity, decimal Price);
    public record AddPoRequest(
        string Id,
        string PoNumber,
        string VendorId,
        List<AddPoItemRequest> Items,
        decimal TotalAmount,
        string Status
    );

    [HttpPost("/api/proposed-pos")]
    public async Task<IActionResult> AddProposedPO([FromBody] AddPoRequest request, CancellationToken cancellationToken)
    {
        var po = new PurchaseOrder
        {
            Id = Guid.TryParse(request.Id, out var parsedId) ? parsedId : Guid.NewGuid(),
            PoNumber = request.PoNumber,
            VendorId = Guid.TryParse(request.VendorId, out var parsedVendorId) ? parsedVendorId : Guid.Empty,
            WarehouseId = Guid.Parse("b1111111-b111-b111-b111-b11111111111"), // Main Warehouse
            TotalAmount = request.TotalAmount,
            Status = request.Status == "PROPOSED" ? "Proposed" : request.Status,
            ProposedByVendor = true,
            CreatedAt = DateTime.UtcNow
        };

        foreach (var item in request.Items)
        {
            po.Items.Add(new PurchaseOrderItem
            {
                Id = Guid.NewGuid(),
                PurchaseOrderId = po.Id,
                ProductId = Guid.TryParse(item.ProductId, out var parsedProdId) ? parsedProdId : Guid.Empty,
                Quantity = item.Quantity,
                UnitPrice = item.Price,
                SubTotal = item.Quantity * item.Price
            });
        }

        await _poRepo.AddAsync(po);
        return Ok(new { message = "Proposed PO added successfully.", id = po.Id });
    }

    // 3. PUT /api/proposed-pos/{id} - Updates a proposed PO's status
    [HttpPut("/api/proposed-pos/{id}")]
    public async Task<IActionResult> UpdateProposedPO(Guid id, [FromBody] System.Text.Json.JsonElement updates, CancellationToken cancellationToken)
    {
        var po = await _poRepo.GetAll().Include(p => p.Items).FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (po == null)
        {
            return NotFound(new { message = "PO not found." });
        }

        if (updates.TryGetProperty("status", out var statusProp))
        {
            var statusStr = statusProp.GetString()?.ToUpperInvariant();
            po.Status = statusStr switch
            {
                "PROPOSED" => "Proposed",
                "APPROVED" => "Approved",
                "REJECTED" => "Rejected",
                _ => po.Status
            };
        }

        await _poRepo.UpdateAsync(po);
        return Ok(new { message = "PO updated successfully." });
    }

    // 4. GET /api/stock-batches - Lists all active FIFO stock lots/batches
    [HttpGet("/api/stock-batches")]
    public async Task<IActionResult> GetStockBatches(CancellationToken cancellationToken)
    {
        var list = await _batchRepo.GetAll()
            .Include(b => b.Product)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var result = list.Select(b => new
        {
            id = b.Id.ToString(),
            productId = b.ProductId.ToString(),
            productName = b.Product?.Name ?? "Unknown Product",
            batchNo = b.BatchNumber,
            unitCost = b.UnitCost,
            initialQuantity = b.InitialQuantity,
            remainingQuantity = b.RemainingQuantity,
            receivedDate = b.ReceivedDate.ToString("yyyy-MM-dd HH:mm:ss"),
            expiryDate = b.ExpiryDate?.ToString("yyyy-MM-dd")
        }).ToList();

        return Ok(result);
    }

    // 5. POST /api/stock-batches - Registers a new FIFO inventory stock batch and increments main product quantities
    public record AddBatchRequest(
        string Id,
        string ProductId,
        string BatchNo,
        decimal UnitCost,
        int InitialQuantity,
        int RemainingQuantity,
        string ReceivedDate,
        string ExpiryDate
    );

    [HttpPost("/api/stock-batches")]
    public async Task<IActionResult> AddStockBatch([FromBody] AddBatchRequest request, CancellationToken cancellationToken)
    {
        var batch = new StockBatch
        {
            Id = Guid.TryParse(request.Id, out var parsedId) ? parsedId : Guid.NewGuid(),
            ProductId = Guid.TryParse(request.ProductId, out var parsedProdId) ? parsedProdId : Guid.Empty,
            WarehouseId = Guid.Parse("b1111111-b111-b111-b111-b11111111111"), // Main Warehouse
            PurchaseOrderId = Guid.Empty,
            BatchNumber = request.BatchNo,
            UnitCost = request.UnitCost,
            InitialQuantity = request.InitialQuantity,
            RemainingQuantity = request.RemainingQuantity,
            ReceivedDate = DateTime.TryParse(request.ReceivedDate, out var parsedRec) ? parsedRec : DateTime.UtcNow,
            ExpiryDate = DateTime.TryParse(request.ExpiryDate, out var parsedExp) ? parsedExp : (DateTime?)null
        };

        await _batchRepo.AddAsync(batch);

        // Also update product stock quantity!
        var product = await _productRepo.GetAll().FirstOrDefaultAsync(p => p.Id == batch.ProductId, cancellationToken);
        if (product != null)
        {
            product.StockQuantity += batch.InitialQuantity;
            product.UpdatedAt = DateTime.UtcNow;
            await _productRepo.UpdateAsync(product);
        }

        return Ok(new { message = "Stock batch registered successfully.", id = batch.Id });
    }
}
