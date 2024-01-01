namespace TwoPhaseSolver
{
    public struct Constants
    {
        public const int N_CO = 2187; // 3^7
        public const int N_EO = 2048; // 2^12
        public const int N_UD = 495;  // 12! / (4! * 8!)

        public const int N_CP = 40320;  // 8!
        public const int N_EP2 = 40320; // 8!
        public const int N_UDS = 11880; // 12! / 8!
        public const int N_UD2 = 24;    // 4!
    }

    public static class FaceletPositions
    {
        public const int U1 = 0 + 8 * 0;
        public const int U2 = 1 + 8 * 0;
        public const int U3 = 2 + 8 * 0;
        public const int U4 = 3 + 8 * 0;
        public const int U6 = 4 + 8 * 0;
        public const int U7 = 5 + 8 * 0;
        public const int U8 = 6 + 8 * 0;
        public const int U9 = 7 + 8 * 0;

        public const int R1 = 0 + 8 * 1;
        public const int R2 = 1 + 8 * 1;
        public const int R3 = 2 + 8 * 1;
        public const int R4 = 3 + 8 * 1;
        public const int R6 = 4 + 8 * 1;
        public const int R7 = 5 + 8 * 1;
        public const int R8 = 6 + 8 * 1;
        public const int R9 = 7 + 8 * 1;

        public const int F1 = 0 + 8 * 2;
        public const int F2 = 1 + 8 * 2;
        public const int F3 = 2 + 8 * 2;
        public const int F4 = 3 + 8 * 2;
        public const int F6 = 4 + 8 * 2;
        public const int F7 = 5 + 8 * 2;
        public const int F8 = 6 + 8 * 2;
        public const int F9 = 7 + 8 * 2;

        public const int L1 = 0 + 8 * 3;
        public const int L2 = 1 + 8 * 3;
        public const int L3 = 2 + 8 * 3;
        public const int L4 = 3 + 8 * 3;
        public const int L6 = 4 + 8 * 3;
        public const int L7 = 5 + 8 * 3;
        public const int L8 = 6 + 8 * 3;
        public const int L9 = 7 + 8 * 3;

        public const int B1 = 0 + 8 * 4;
        public const int B2 = 1 + 8 * 4;
        public const int B3 = 2 + 8 * 4;
        public const int B4 = 3 + 8 * 4;
        public const int B6 = 4 + 8 * 4;
        public const int B7 = 5 + 8 * 4;
        public const int B8 = 6 + 8 * 4;
        public const int B9 = 7 + 8 * 4;

        public const int D1 = 0 + 8 * 5;
        public const int D2 = 1 + 8 * 5;
        public const int D3 = 2 + 8 * 5;
        public const int D4 = 3 + 8 * 5;
        public const int D6 = 4 + 8 * 5;
        public const int D7 = 5 + 8 * 5;
        public const int D8 = 6 + 8 * 5;
        public const int D9 = 7 + 8 * 5;
    }
}
