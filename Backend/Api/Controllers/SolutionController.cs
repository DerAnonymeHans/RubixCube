using Microsoft.AspNetCore.Mvc;
using RubixCubeBackend.Features.Solver;
using RubixCubeBackend.Features.Solver.Models;

namespace RubixCubeBackend.Controllers;

[ApiController]
[Route("[controller]")]
public class SolutionController : ControllerBase
{
    private readonly ILogger<FrontendController> _logger;
    private readonly SolverService _solver;

    public SolutionController(ILogger<FrontendController> logger, SolverService solver)
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
