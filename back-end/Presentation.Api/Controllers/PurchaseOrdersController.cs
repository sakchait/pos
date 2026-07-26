// ตัวอย่าง: Controller สำหรับฝ่ายจัดซื้อ (PurchaserManager)
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("external/[controller]")]
[Authorize(Roles = "PurchaserManager")] // ล็อกสิทธิ์เฉพาะ PurchaserManager
public class PurchaseOrdersController : ControllerBase
{
    [HttpPost("approve/{poId}")]
    public async Task<IActionResult> ApprovePo(Guid poId)
    {
        // โค้ดอนุมัติ PO และอัปเดตสต็อก
        return Ok(new { message = "Approved successfully" });
    }
}

// ตัวอย่าง: Controller สำหรับฝ่ายบัญชี (Accountant)
[ApiController]
[Route("external/[controller]")]
[Authorize(Roles = "Accountant,BranchManager")] // ให้สิทธิ์ บัญชี และ ผู้จัดการสาขา เข้าดูได้
public class AccountingReportsController : ControllerBase
{
    [HttpGet("fifo-stock-card")]
    public async Task<IActionResult> GetFifoReport()
    {
        return Ok();
    }
}