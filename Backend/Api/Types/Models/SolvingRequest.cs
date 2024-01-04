using RubixCubeBackend.Types.Enums;

namespace RubixCubeBackend.Types.Models;

internal class SolvingRequest
{
    public SolvingAlgorithm Algorithm { get; init; } = SolvingAlgorithm.TwoPhaseSolver;
}
