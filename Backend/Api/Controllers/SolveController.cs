using Microsoft.AspNetCore.Mvc;
using Api.Features.Solver;
using Api.Features.Solver.Models;

namespace Api.Controllers;

[ApiController]
[Route("[controller]")]
public class SolveController : ControllerBase
{
    private readonly ILogger<FrontendController> _logger;
    private readonly SolverService _solver;

    public SolveController(ILogger<FrontendController> logger, SolverService solver)
    {
        _logger = logger;
        _solver = solver;
    }

    [HttpGet]
    public async Task<IActionResult> GetSolution([FromQuery] SolvingRequest request)
    {
        return Ok(await _solver.SolveCube(request));
    }


}
