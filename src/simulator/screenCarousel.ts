export function moveLeft(currentIndex: number, count: number): number {
  if (count <= 0) {
    return 0;
  }

  return Math.max(currentIndex - 1, 0);
}

export function moveRight(currentIndex: number, count: number): number {
  if (count <= 0) {
    return 0;
  }

  return Math.min(currentIndex + 1, count - 1);
}

export function moveUp(currentIndex: number, count: number): number {
  return moveLeft(currentIndex, count);
}

export function moveDown(currentIndex: number, count: number): number {
  return moveRight(currentIndex, count);
}
