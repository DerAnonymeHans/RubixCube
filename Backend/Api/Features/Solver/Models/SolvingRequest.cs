namespace Api.Features.Solver.Models;

public class SolvingRequest
{
    public SolvingAlgorithm Algorithm { get; init; } = SolvingAlgorithm.TwoPhaseSolver;
    public required short[] Facelets { get; init; }
}
