
import { Position, CubeState } from '../types.ts';

/**
 * 检查一组坐标是否在 3x3 网格内是连通的
 */
function checkConnectivity(cells: { x: number; y: number }[]): boolean {
  if (cells.length === 0) return true;
  if (cells.length === 1) return true;
  
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
      // Fix: Use current.x instead of current.y for the x coordinate
      { x: current.x, y: current.y - 1 },
    ];
    for (const neighbor of neighbors) {
      const key = `${neighbor.x},${neighbor.y}`;
      if (!visited.has(key) && cells.some(c => c.x === neighbor.x && c.y === neighbor.y)) {
        visited.add(key);
        queue.push(neighbor);
      }
    }
  }
  return count === cells.length;
}

/**
 * 从可用池中生成一个连通的子集
 * 使用增长算法：从随机一点开始，不断向邻近的可用格点扩张
 */
function getConnectedSubset(pool: { x: number; y: number }[], minCount: number): { x: number; y: number }[] {
  if (pool.length < minCount) return [];
  
  const targetCount = Math.max(minCount, Math.floor(Math.random() * (pool.length + 1)));
  if (targetCount === 0) return [];
  
  const result: { x: number; y: number }[] = [];
  const available = [...pool];
  
  // 随机选一个起点
  const startIndex = Math.floor(Math.random() * available.length);
  const start = available.splice(startIndex, 1)[0];
  result.push(start);
  
  while (result.length < targetCount && available.length > 0) {
    // 找出所有与当前已选区域相邻的可用点
    const frontierIndices: number[] = [];
    for (let i = 0; i < available.length; i++) {
      const p = available[i];
      const isNeighbor = result.some(r => 
        (Math.abs(r.x - p.x) === 1 && r.y === p.y) || 
        (Math.abs(r.y - p.y) === 1 && r.x === p.x)
      );
      if (isNeighbor) {
        frontierIndices.push(i);
      }
    }
    
    if (frontierIndices.length === 0) break; // 无法继续扩张（通常不会发生，除非池本身不连通）
    
    // 随机选一个邻居加入
    const pickIndex = frontierIndices[Math.floor(Math.random() * frontierIndices.length)];
    result.push(available.splice(pickIndex, 1)[0]);
  }
  
  return result;
}

export function generatePuzzle(): CubeState {
  const all3x3: { x: number; y: number }[] = [];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) all3x3.push({ x: i, y: j });

  let finalPositions: Position[] = [];
  let totalCount = 0;

  // 循环直到满足：总数 >= 3 且 至少有 2 层
  while (totalCount < 3) {
    // 第一层：至少 2 个，确保连通（增长算法自动保证）
    const layer0Cells = getConnectedSubset(all3x3, 2); 
    
    // 第二层：必须位于第一层之上，且连通
    const layer1Cells = getConnectedSubset(layer0Cells, 1);
    
    if (layer1Cells.length === 0) continue;

    // 第三层：位于第二层之上
    const layer2Cells = getConnectedSubset(layer1Cells, 0);

    finalPositions = [
      ...layer0Cells.map(c => ({ ...c, z: 0 })),
      ...layer1Cells.map(c => ({ ...c, z: 1 })),
      ...layer2Cells.map(c => ({ ...c, z: 2 })),
    ];
    totalCount = finalPositions.length;
  }

  return { positions: finalPositions, totalCount };
}
