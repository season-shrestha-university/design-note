export const STAGGERED_ROW_PATTERN = [2, 3, 4, 1] as const;

export const STAGGERED_CYCLE_SIZE = STAGGERED_ROW_PATTERN.reduce(
  (total, size) => total + size,
  0,
);

const STAGGERED_ROW_OFFSETS = STAGGERED_ROW_PATTERN.reduce<number[]>(
  (offsets, _, index) => {
    if (index === 0) return [0];

    return [
      ...offsets,
      offsets[index - 1]! + STAGGERED_ROW_PATTERN[index - 1]!,
    ];
  },
  [],
);

export function staggeredRowSize(rowIndex: number): number {
  return STAGGERED_ROW_PATTERN[rowIndex % STAGGERED_ROW_PATTERN.length];
}

export function groupIntoStaggeredRows<T>(items: T[]): T[][] {
  const rows: T[][] = [];
  let index = 0;
  let rowIndex = 0;

  while (index < items.length) {
    const rowSize = staggeredRowSize(rowIndex);
    rows.push(items.slice(index, index + rowSize));
    index += rowSize;
    rowIndex += 1;
  }

  return rows;
}

export function staggeredCardIndex(
  rowIndex: number,
  columnIndex: number,
): number {
  const cycle = Math.floor(rowIndex / STAGGERED_ROW_PATTERN.length);
  const positionInCycle = rowIndex % STAGGERED_ROW_PATTERN.length;
  const startOffset =
    cycle * STAGGERED_CYCLE_SIZE + STAGGERED_ROW_OFFSETS[positionInCycle]!;

  return startOffset + columnIndex + 1;
}
