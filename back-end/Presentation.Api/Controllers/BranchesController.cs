using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pos.Application.Repositories;
using Pos.Domain.Entities;
using Presentation.Api.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Pos.Api.Controllers;

[ApiController]
[ApiKey]
[Route("api/[controller]")]
public class BranchesController : ControllerBase
{
    private readonly IRepository<Branch> _branchRepo;
    private readonly IRepository<PosTerminal> _terminalRepo;

    public BranchesController(IRepository<Branch> branchRepo, IRepository<PosTerminal> terminalRepo)
    {
        _branchRepo = branchRepo;
        _terminalRepo = terminalRepo;
    }

    [HttpGet]
    public async Task<IActionResult> GetBranches(CancellationToken cancellationToken)
    {
        var branches = await _branchRepo.GetAll()
            .AsNoTracking()
            .Select(b => new
            {
                id = b.Id,
                code = b.Code,
                name = b.Name,
                address = b.Address,
                taxId = b.TaxId
            })
            .ToListAsync(cancellationToken);

        return Ok(branches);
    }

    [HttpGet("{branchId}/terminals")]
    public async Task<IActionResult> GetTerminals(Guid branchId, CancellationToken cancellationToken)
    {
        var terminals = await _terminalRepo.GetAll()
            .AsNoTracking()
            .Where(t => t.BranchId == branchId)
            .Select(t => new
            {
                id = t.Id,
                terminalId = t.TerminalId,
                name = t.Name,
                branchId = t.BranchId
            })
            .ToListAsync(cancellationToken);

        return Ok(terminals);
    }
}
