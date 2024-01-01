using Api.Features.Solver.Models;

namespace Api.Features.Solver.Contracts;

public interface ISolvingMethod
{
    public SolvingAlgorithm Algorithm { get; }

    public Task<SolvingSolution> Solve(CubeDescriptor cubeDescription);
}
