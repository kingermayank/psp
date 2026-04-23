import { describe, expect, it } from 'vitest';
import { moveDown, moveLeft, moveRight, moveUp } from '../simulator/screenCarousel';

describe('screenCarousel', () => {
  it('clamps when moving left from first item', () => {
    expect(moveLeft(0, 4)).toBe(0);
  });

  it('clamps when moving right from last item', () => {
    expect(moveRight(3, 4)).toBe(3);
  });

  it('moves normally when inside bounds', () => {
    expect(moveLeft(2, 7)).toBe(1);
    expect(moveRight(2, 7)).toBe(3);
    expect(moveUp(2, 7)).toBe(1);
    expect(moveDown(2, 7)).toBe(3);
  });

  it('returns 0 when app count is empty', () => {
    expect(moveLeft(2, 0)).toBe(0);
    expect(moveRight(2, 0)).toBe(0);
  });
});
