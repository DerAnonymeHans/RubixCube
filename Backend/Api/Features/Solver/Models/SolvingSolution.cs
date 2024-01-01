namespace Api.Features.Solver.Models;

public class SolvingSolution
{
    public short[] Moves { get; set; }

    public SolvingSolution(short[] moves)
    {
        Moves = moves;
    }

    public SolvingSolution(byte[] moves)
    {
        Moves = moves.Select(x => (short)x).ToArray();
    }

    public short this[int key]
    {
        get => Moves[key];
        set => Moves[key] = value;
    }


}
