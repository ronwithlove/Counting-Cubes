
export type Position = {
  x: number;
  y: number;
  z: number;
};

export type CubeState = {
  positions: Position[];
  totalCount: number;
};

export interface HintResponse {
  message: string;
  isCorrect?: boolean;
}
