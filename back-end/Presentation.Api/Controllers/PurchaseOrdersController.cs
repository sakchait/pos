// ตัวอย่าง: Controller สำหรับฝ่ายจัดซื้อ (PurchaserManager)
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pos.Application.Repositories;
using Pos.Domain.Entities;
using System;
using System.Threading.Tasks;

[ApiController]
[Route("api/external/[controller]")]
[Authorize(Roles = "PurchaserManager")] // ล็อกสิทธิ์เฉพาะ PurchaserManager
public class PurchaseOrdersController : ControllerBase
{
    [HttpPost("approve/{poId}")]
    [AllowAnonymous]
    public async Task<IActionResult> ApprovePo(
        Guid poId,
        [FromServices] IRepository<PurchaseOrder> poRepo,
        [FromServices] IRepository<StockBatch> batchRepo,
        [FromServices] IRepository<Product> productRepo)
    {
        var po = await poRepo.GetAll()
            .Include(p => p.Items)
            .FirstOrDefaultAsync(p => p.Id == poId);

        if (po == null)
            return NotFound(new { message = "Proposed PO not found." });

        if (po.Status == "Approved")
            return BadRequest(new { message = "PO is already approved." });

        po.Status = "Approved";
        po.ApprovedBy = Guid.Parse("33333333-3333-3333-3333-333333333304"); // Elena Rostova
        po.ApprovedAt = DateTime.UtcNow;

        await poRepo.UpdateAsync(po);

        // Generate stock batches for each item
        int itemIndex = 1;
        foreach (var item in po.Items)
        {
            var batch = new StockBatch
            {
                Id = Guid.NewGuid(),
                WarehouseId = po.WarehouseId != Guid.Empty ? po.WarehouseId : Guid.Parse("b1111111-b111-b111-b111-b11111111111"), // Main Warehouse
                ProductId = item.ProductId,
                PurchaseOrderId = po.Id,
                BatchNumber = $"BATCH-{po.PoNumber}-{itemIndex++}",
                UnitCost = item.UnitPrice,
                InitialQuantity = item.Quantity,
                RemainingQuantity = item.Quantity,
                ReceivedDate = DateTime.UtcNow,
                ExpiryDate = DateTime.UtcNow.AddMonths(12) // Default 1 year expiry
            };

            await batchRepo.AddAsync(batch);

            // Update product stock quantity
            var product = await productRepo.GetAll().FirstOrDefaultAsync(p => p.Id == item.ProductId);
            if (product != null)
            {
                product.StockQuantity += item.Quantity;
                product.UpdatedAt = DateTime.UtcNow;
                await productRepo.UpdateAsync(product);
            }
        }

        return Ok(new { message = "Approved successfully", id = po.Id });
    }
}

// ตัวอย่าง: Controller สำหรับฝ่ายบัญชี (Accountant)
[ApiController]
[Route("api/external/[controller]")]
[Authorize(Roles = "Accountant,BranchManager")] // ให้สิทธิ์ บัญชี และ ผู้จัดการสาขา เข้าดูได้
public class AccountingReportsController : ControllerBase
{
    [HttpGet("fifo-stock-card")]
    public async Task<IActionResult> GetFifoReport()
    {
        return Ok();
    }
}