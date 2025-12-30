
import { Position, CubeState } from '../types';

/**
 * Checks if a set of 2D coordinates are connected in a 3x3 grid.
 */
function checkConnectivity(cells: { x: number; y: number }[]): boolean {
  if (cells.length <= 2) return true;

  const visited = new Set<string>();
  const queue = [cells[0]];
  visited.add(`${cells[0].x},${cells[0].y}`);

  let count = 0;
  while (queue.length > 0) {
    const current = queue.shift()!;
    count++;

    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 },
    ];

    for (const neighbor of neighbors) {
      const key = `${neighbor.x},${neighbor.y}`;
      if (
        neighbor.x >= 0 && neighbor.x < 3 &&
        neighbor.y >= 0 && neighbor.y < 3 &&
        !visited.has(key) &&
        cells.some(c => c.x === neighbor.x && c.y === neighbor.y)
      ) {
        visited.add(key);
        queue.push(neighbor);
      }
    }
  }

  return count === cells.length;
}

/**
 * Generates a valid subset of cells from a base set that are connected.
 */
function getRandomSubset(baseCells: { x: number; y: number }[], minCount: number): { x: number; y: number }[] {
  if (baseCells.length === 0) return [];
  
  // Decide how many cubes for this layer
  const targetCount = Math.floor(Math.random() * (baseCells.length + 1));
  if (targetCount === 0) return [];

  // Randomly pick until connected or max attempts
  for (let attempts = 0; attempts < 100; attempts++) {
    const shuffled = [...baseCells].sort(() => Math.random() - 0.5);
    const subset = shuffled.slice(0, targetCount);
    if (checkConnectivity(subset)) {
      return subset;
    }
  }
  
  // Fallback: pick just one
  return [baseCells[Math.floor(Math.random() * baseCells.length)]];
}

export function generatePuzzle(): CubeState {
  // Layer 0 (Bottom)
  const all3x3: { x: number; y: number }[] = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      all3x3.push({ x: i, y: j });
    }
  }

  // Ensure layer 0 has at least 1 cube
  let layer0Cells: { x: number; y: number }[] = [];
  while (layer0Cells.length === 0) {
    layer0Cells = getRandomSubset(all3x3, 1);
  }

  // Layer 1 (Middle) - must be subset of Layer 0
  const layer1Cells = getRandomSubset(layer0Cells, 0);

  // Layer 2 (Top) - must be subset of Layer 1
  const layer2Cells = getRandomSubset(layer1Cells, 0);

  const finalPositions: Position[] = [
    ...layer0Cells.map(c => ({ ...c, z: 0 })),
    ...layer1Cells.map(c => ({ ...c, z: 1 })),
    ...layer2Cells.map(c => ({ ...c, z: 2 })),
  ];

  return {
    positions: finalPositions,
    totalCount: finalPositions.length,
  };
}
