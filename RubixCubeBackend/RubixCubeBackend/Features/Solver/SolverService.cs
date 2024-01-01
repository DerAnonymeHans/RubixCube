using RubixCubeBackend.Features.Solver.Contracts;
using RubixCubeBackend.Features.Solver.Models;

namespace RubixCubeBackend.Features.Solver;

public class SolverService
{
    private readonly IEnumerable<ISolvingMethod> _solvingMethods;

    public SolverService(IEnumerable<ISolvingMethod> solvingMethods)
    {
        _solvingMethods = solvingMethods;
    }

    public Task<SolvingSolution> SolveCube(SolvingRequest request)
    {
        var cubeDescriptor = new CubeDescriptor(request.Facelets);

        foreach (var solvingMethod in _solvingMethods)
        {
            if (solvingMethod.Algorithm != request.Algorithm) continue;

            return solvingMethod.Solve(cubeDescriptor);
        }
        throw new NotImplementedException("The solving Algorithm was not found.");
    }
}
