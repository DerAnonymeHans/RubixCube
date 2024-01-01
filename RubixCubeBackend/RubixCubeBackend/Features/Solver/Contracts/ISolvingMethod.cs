using RubixCubeBackend.Features.Solver.Models;

namespace RubixCubeBackend.Features.Solver.Contracts;

public interface ISolvingMethod
{
    public SolvingAlgorithm Algorithm { get; }

    public Task<SolvingSolution> Solve(CubeDescriptor cubeDescription);
}
