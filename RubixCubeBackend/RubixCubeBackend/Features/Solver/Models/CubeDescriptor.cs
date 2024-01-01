namespace RubixCubeBackend.Features.Solver.Models;

public class CubeDescriptor
{
    public short[] Facelets { get; init; }

    public CubeDescriptor(short[] facelets)
    {
        Facelets = facelets;
    }

    public byte[] FaceletBytes => Facelets.Select(x => (byte)x).ToArray();

}
