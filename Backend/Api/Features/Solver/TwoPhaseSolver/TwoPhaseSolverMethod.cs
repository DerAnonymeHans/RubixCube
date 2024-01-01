using Api.Features.Solver.Contracts;
using Api.Features.Solver.Models;
using TwoPhaseSolver;

namespace Api.Features.Solver.TwoPhaseSolver;

internal class TwoPhaseSolverMethod : ISolvingMethod
{
    public SolvingAlgorithm Algorithm => SolvingAlgorithm.TwoPhaseSolver;

    public Task<SolvingSolution> Solve(CubeDescriptor cubeDescription)
    {
        var cube = new Cube(cubeDescription.FaceletBytes);
        var move = Search.patternSolve(cube, Move.None, 22, timeoutMS: 10000, printInfo: false);
        return Task.FromResult(new SolvingSolution(move.moveList));

    }
}
