import { describe, it, expect } from "vitest";

// Small helper mirroring the inline logic in Dashboard.tsx
function getSortedYears(courses: { year: number }[]) {
  return [...new Set(courses.map((c) => c.year))].sort((a, b) => a - b);
}

describe("Dashboard year sorting", () => {
  it("sorts years numerically, not lexicographically", () => {
    const courses = [
      { year: 3 },
      { year: 1 },
      { year: 2 },
      { year: 10 },
      { year: 1 },
    ];
    const years = getSortedYears(courses);
    expect(years).toEqual([1, 2, 3, 10]);
  });

  it("handles empty courses", () => {
    expect(getSortedYears([])).toEqual([]);
  });

  it("deduplicates years before sorting", () => {
    const courses = [{ year: 2 }, { year: 2 }, { year: 2 }];
    expect(getSortedYears(courses)).toEqual([2]);
  });
});
