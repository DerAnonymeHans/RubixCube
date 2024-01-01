using RubixCubeBackend.Features.Solver.Contracts;
using RubixCubeBackend.Features.Solver.Models;
using TwoPhaseSolver;

namespace RubixCubeBackend.Features.Solver.TwoPhaseSolver;

internal class TwoPhaseSolverMethod : ISolvingMethod
{
    public SolvingAlgorithm Algorithm => SolvingAlgorithm.TwoPhaseSolver;

    public Task<SolvingSolution> Solve(CubeDescriptor cubeDescription)
    {
        var cube = new Cube(cubeDescription.FaceletBytes);
        var move = Search.patternSolve(cube, Move.None, 24, timeoutMS: 30000, printInfo: true);
        return Task.FromResult(new SolvingSolution(move.moveList));

    }
}
