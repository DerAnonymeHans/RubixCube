import { TileColor } from "../cube/colors";
import { Plane, RotationCommand, RotationDirection } from "../cube/commands";
import { CubeFace, FacePosition } from "../cube/cube";
import { LocalRelation, TilePosition } from "./types";

export function bringCenterToDifferentFace(from: CubeFace, to: FacePosition): RotationCommand[] {
    if (from.facePosition === to) return [];

    const commands: RotationCommand[] = [];
    for (const neighbour of from.neighbourList) {
        if (neighbour.relation.face.facePosition !== to) continue;
        commands.push(mapLocalToGlobalRotation(from, neighbour.rotation, 1));
        break;
    }
    if (commands.length === 0) {
        const neighbour = from.neighbourList[0];
        commands.push(mapLocalToGlobalRotation(from, neighbour.rotation, 1));
        commands.push(...bringCenterToDifferentFace(neighbour.relation.face, to));
    }

    return commands;
}

export function bringEdgeToDifferentFace(from: TilePosition, to: FacePosition): RotationCommand[] {
    if (from.face.facePosition === to) return [];

    const commands: RotationCommand[] = [];
    for (const neighbour of from.face.neighbourList) {
        if (neighbour.relation.face.facePosition !== to) continue;
        commands.push(mapLocalToGlobalRotation(from.face, neighbour.rotation, 1));
        break;
    }

    if (commands.length === 0) {
        const neighbour = from.face.neighbourList[0];
        commands.push(mapLocalToGlobalRotation(from.face, neighbour.rotation, 1));
        commands.push(...bringCenterToDifferentFace(neighbour.relation.face, to));
    }

    return commands;
}

export function mapLocalToGlobalRotation(local: CubeFace, rotation: LocalRelation, idx: number): RotationCommand {
    if (rotation === LocalRelation.left || rotation == LocalRelation.right) {
        const rightIsRight = rotation === LocalRelation.right ? RotationDirection.right : RotationDirection.left;

        const leftIsRight = rotation === LocalRelation.left ? RotationDirection.right : RotationDirection.left;

        if (local.facePosition === FacePosition.top) {
            return new RotationCommand(Plane.zPlane, idx, idx > 0 ? rightIsRight : leftIsRight);
        }
        if (local.facePosition === FacePosition.bottom) {
            return new RotationCommand(Plane.zPlane, 2 - idx, idx === 2 ? rightIsRight : leftIsRight);
        }

        if (local.facePosition === FacePosition.right) {
            return new RotationCommand(Plane.yPlane, 2 - idx, idx === 2 ? rightIsRight : leftIsRight);
        }
        if (local.facePosition === FacePosition.left) {
            return new RotationCommand(Plane.yPlane, 2 - idx, idx < 2 ? leftIsRight : rightIsRight);
        }

        if (local.facePosition === FacePosition.front) {
            return new RotationCommand(Plane.yPlane, 2 - idx, idx === 2 ? rightIsRight : leftIsRight);
        }
        if (local.facePosition === FacePosition.back) {
            return new RotationCommand(Plane.yPlane, 2 - idx, idx === 2 ? rightIsRight : leftIsRight);
        }
    }

    const topIsRight = rotation === LocalRelation.up ? RotationDirection.right : RotationDirection.left;

    const topIsLeft = rotation === LocalRelation.up ? RotationDirection.left : RotationDirection.right;

    if (local.facePosition === FacePosition.right) {
        return new RotationCommand(Plane.zPlane, 2 - idx, idx < 2 ? topIsLeft : topIsRight);
    }
    if (local.facePosition === FacePosition.left) {
        return new RotationCommand(Plane.zPlane, idx, idx === 0 ? topIsLeft : topIsRight);
    }

    if (local.facePosition === FacePosition.front) {
        return new RotationCommand(Plane.xPlane, idx, idx > 0 ? topIsRight : topIsLeft);
    }
    if (local.facePosition === FacePosition.back) {
        return new RotationCommand(Plane.xPlane, 2 - idx, idx === 2 ? topIsRight : topIsLeft);
    }

    if (local.facePosition === FacePosition.top) {
        return new RotationCommand(Plane.xPlane, idx, idx > 0 ? topIsRight : topIsLeft);
    }
    if (local.facePosition === FacePosition.bottom) {
        return new RotationCommand(Plane.xPlane, idx, idx > 0 ? topIsRight : topIsLeft);
    }

    throw new Error("Cannot map local to global rotation");
}

// works for front, right, back and left
export function rotateSideFace(sideFace: CubeFace, direction: RotationDirection): RotationCommand {
    return mapLocalToGlobalRotation(
        sideFace.neighbours.right.face,
        direction === RotationDirection.left ? LocalRelation.up : LocalRelation.down,
        0
    );
}

export function getNearestNeigbourForEdge(position: TilePosition) {
    if (position.col !== 1 && position.row !== 1) throw new Error("Not an edge tile");

    if (position.col === 1 && position.row === 0) return position.face.getNeighbour(LocalRelation.up);
    if (position.col === 1 && position.row === 2) return position.face.getNeighbour(LocalRelation.down);
    if (position.row === 1 && position.col === 0) return position.face.getNeighbour(LocalRelation.left);

    return position.face.getNeighbour(LocalRelation.right);
}

export function doesEdgeMatchItsCenter(face: CubeFace, edgePosition: LocalRelation) {
    const center = face.getCell(1, 1);
    let edge: TileColor;
    if (edgePosition === LocalRelation.up) edge = face.getCell(0, 1);
    else if (edgePosition === LocalRelation.left) edge = face.getCell(1, 0);
    else if (edgePosition === LocalRelation.right) edge = face.getCell(1, 2);
    else edge = face.getCell(2, 1);

    return center === edge;
}

export function getCorners(face: CubeFace) {
    return face.tiles().filter((tile) => (tile.col === 0 || tile.col === 2) && (tile.row === 0 || tile.row === 2));
}

export function getEdges(face: CubeFace) {
    return face.tiles().filter((tile) => (tile.row !== 1 && tile.col === 1) || (tile.row === 1 && tile.col !== 1));
}

export type CornerTile = {
    face: CubeFace;
    color: TileColor;
};

export function getCornerTiles(face1: CubeFace, face2: CubeFace, face3: CubeFace): CornerTile[] {
    const getCornerTile = (face: CubeFace, neighbours: CubeFace[], tiles: CornerTile[]): CornerTile[] => {
        if (tiles.length === 3) return tiles;
        let tile: CornerTile = {
            face: face,
            color: null!,
        };
        if (neighbours.includes(face.neighbours.right.face) && neighbours.includes(face.neighbours.top.face)) {
            tile.color = face.getCell(0, 2);
        } else if (
            neighbours.includes(face.neighbours.right.face) &&
            neighbours.includes(face.neighbours.bottom.face)
        ) {
            tile.color = face.getCell(2, 2);
        } else if (neighbours.includes(face.neighbours.bottom.face) && neighbours.includes(face.neighbours.left.face)) {
            tile.color = face.getCell(2, 0);
        } else if (neighbours.includes(face.neighbours.left.face) && neighbours.includes(face.neighbours.top.face)) {
            tile.color = face.getCell(0, 0);
        }

        if (tile.color === null) throw new Error("Cannot get corner tile. Tile is null");
        return getCornerTile(neighbours[0], [neighbours[1], face], [...tiles, tile]);
    };

    return getCornerTile(face1, [face2, face3], []);
}
