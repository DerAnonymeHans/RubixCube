using System.Linq;
using Fc = TwoPhaseSolver.FaceletPositions;

namespace TwoPhaseSolver
{
    public struct Cubie
    {
        public byte pos, orient;

        public Cubie(byte pos, byte orient)
        {
            this.pos = pos;
            this.orient = orient;
        }

        public override string ToString()
        {
            return "Cubie(" + pos.ToString() + ", " + orient.ToString() + ")";
        }
    }

    public partial class Cube
    {
        /* Definitions based on this diagram
                      +---------+
                      | 00 - 07 |
                      |    U    |
                      |    0    |
            +---------+---------+---------+---------+
            | 24 - 31 | 16 - 23 | 08 - 17 | 32 - 39 |
            |    L    |    F    |    R    |    B    |
            |    3    |    2    |    1    |    4    |
            +---------+---------+---------+---------+
                      | 40 - 47 |
                      |    D    |
                      |    5    |
                      +---------+
        */

        private static byte[][] udToPerm = BinLoad.getUdToPerm("tables\\other\\combi");

        private static byte[] Facelets = new byte[48]
        {
            00, 01, 02, 03, 04, 05, 06, 07,
            08, 09, 10, 11, 12, 13, 14, 15,
            16, 17, 18, 19, 20, 21, 22, 23,
            24, 25, 26, 27, 28, 29, 30, 31,
            32, 33, 34, 35, 36, 37, 38, 39,
            40, 41, 42, 43, 44, 45, 46, 47
        };

        private static byte[][] CornerMap = new byte[8][]
        {
            new byte[3] {0, 1, 2},
            new byte[3] {0, 2, 3},
            new byte[3] {0, 3, 4},
            new byte[3] {0, 4, 1},
            new byte[3] {5, 2, 1},
            new byte[3] {5, 3, 2},
            new byte[3] {5, 4, 3},
            new byte[3] {5, 1, 4}
        };

        private static byte[][] EdgeMap = new byte[12][]
        {
            new byte[2] {0, 1},
            new byte[2] {0, 2},
            new byte[2] {0, 3},
            new byte[2] {0, 4},
            new byte[2] {5, 1},
            new byte[2] {5, 2},
            new byte[2] {5, 3},
            new byte[2] {5, 4},
            new byte[2] {2, 1},
            new byte[2] {2, 3},
            new byte[2] {4, 3},
            new byte[2] {4, 1}
        };

        private static byte[][] CornerFacelet = new byte[8][]
        {
            new byte[3] {Fc.U9, Fc.R1, Fc.F3},
            new byte[3] {Fc.U7, Fc.F1, Fc.L3},
            new byte[3] {Fc.U1, Fc.L1, Fc.B3},
            new byte[3] {Fc.U3, Fc.B1, Fc.R3},
            new byte[3] {Fc.D3, Fc.F9, Fc.R7},
            new byte[3] {Fc.D1, Fc.L9, Fc.F7},
            new byte[3] {Fc.D7, Fc.B9, Fc.L7},
            new byte[3] {Fc.D9, Fc.R9, Fc.B7},
        };

        private static byte[][] EdgeFacelet = new byte[12][]
        {
            new byte[2] {Fc.U6, Fc.R2},
            new byte[2] {Fc.U8, Fc.F2},
            new byte[2] {Fc.U4, Fc.L2},
            new byte[2] {Fc.U2, Fc.B2},
            new byte[2] {Fc.D6, Fc.R8},
            new byte[2] {Fc.D2, Fc.F8},
            new byte[2] {Fc.D4, Fc.L8},
            new byte[2] {Fc.D8, Fc.B8},
            new byte[2] {Fc.F6, Fc.R4},
            new byte[2] {Fc.F4, Fc.L6},
            new byte[2] {Fc.B6, Fc.L4},
            new byte[2] {Fc.B4, Fc.R6},
        };

        private static byte[] USlice = new byte[4] { 0, 1, 2, 3 };
        private static byte[] DSlice = new byte[4] { 4, 5, 6, 7 };
        private static byte[] UDSlice = new byte[4] { 8, 9, 10, 11 };

        public Cubie[] corners;
        public Cubie[] edges;

        public Cube(Cubie[] corners = null, Cubie[] edges = null)
        {
            this.corners = corners ?? new Cubie[8]
            {
                new Cubie(0, 0), new Cubie(1, 0), new Cubie(2, 0), new Cubie(3, 0),
                new Cubie(4, 0), new Cubie(5, 0), new Cubie(6, 0), new Cubie(7, 0)
            };

            this.edges = edges ?? new Cubie[12]
            {
                new Cubie(0, 0), new Cubie(1, 0), new Cubie(2, 0), new Cubie(3, 0),
                new Cubie(4, 0), new Cubie(5, 0), new Cubie(6, 0), new Cubie(7, 0),
                new Cubie(8, 0), new Cubie(9, 0), new Cubie(10, 0), new Cubie(11, 0)
            };
        }

        public Cube(byte[] faceletColors)
        {
            corners = new Cubie[8];
            edges = new Cubie[12];
            byte[] tuple, cubie;
            int i, o, val;

            for (i = 0; i < 8; i++)
            {
                tuple = CornerFacelet[i];
                cubie = tuple.Select(x => faceletColors[x]).ToArray();
                val = CornerMap.Index(cubie, Tools.setEquals);
                o = cubie.Index(CornerMap[val][0]);
                corners[i] = new Cubie((byte)val, (byte)o);
            }

            for (i = 0; i < 12; i++)
            {
                tuple = EdgeFacelet[i];
                cubie = tuple.Select(x => faceletColors[x]).ToArray();
                val = EdgeMap.Index(cubie, Tools.setEquals);
                o = cubie.Index(EdgeMap[val][0]);
                edges[i] = new Cubie((byte)val, (byte)o);
            }
        }

        public Cube(Cube other)
        {
            corners = other.corners.Select(x => new Cubie(x.pos, x.orient)).ToArray();
            edges = other.edges.Select(x => new Cubie(x.pos, x.orient)).ToArray();
        }

        public byte[] getFacelets()
        {
            byte[] facelets = new byte[48];
            int i, j;

            for (i = 0; i < 8; i++)
            {
                Cubie c = corners[i];
                var ct = CornerFacelet[c.pos].rotate(c.orient);
                for (j = 0; j < 3; j++) { facelets[CornerFacelet[i][j]] = ct[j]; }
            }

            for (i = 0; i < 12; i++)
            {
                Cubie e = edges[i];
                var et = EdgeFacelet[e.pos].rotate(e.orient);
                for (j = 0; j < 2; j++) { facelets[EdgeFacelet[i][j]] = et[j]; }
            }

            return facelets;
        }

        public byte[] getFaceletColors()
        {
            return getFacelets().Select(x => (byte)(x / 8)).ToArray();
        }

        public void apply(Move m)
        {
            Cube c = m.apply(this);
            edges = c.edges;
            corners = c.corners;
        }

        public bool isSolved()
        {
            return (
                cornOrientCoord() == 0 &&
                edgeOrientCoord() == 0 &&
                cornPermCoord() == 0 &&
                edgePermCoord() == 0
           );
        }

        public bool isPhase2()
        {
            return (
                cornOrientCoord() == 0 &&
                edgeOrientCoord() == 0 &&
                UDSliceCoord() == 0
            );
        }
    }
}
