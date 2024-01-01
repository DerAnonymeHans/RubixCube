<!-- @format -->

# Introduction

This Project contains the source code for a rubix cube solver website. The websites provides a number of different algorithms which can be used to solve any random cube. It is also possible to scan a cube with the devices camera.

## Algorithms

| Algorithm        | Description                                                                  | Speed                                                          |
| ---------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Beginners method | White cross, White corners, Middle layer edges, yellow cross, yellow corners | avg. of 180 rotations                                          |
| Advanced method  | White cross, FTL, OLL, PLL                                                   | avg. of 80 rotations                                           |
| TwoPhase-Solver  | see http://kociemba.org/math/twophase.htm                                    | less then 22 rotations (any cube can be solved in <= 20 moves) |

# Getting Started

## Build

```
docker build -t rubix-cube .
```
