import { expect, test } from "vitest";
import { formatReviewDate } from "./format-review-date";

test("suomenkielinen päiväys käännetään englanniksi, tuntematon jää ennalleen", () => {
  expect(formatReviewDate("helmikuu 2024", "en")).toBe("February 2024");
  expect(formatReviewDate("Joulukuu 2025", "en")).toBe("December 2025");
  expect(formatReviewDate("helmikuu 2024", "fi")).toBe("helmikuu 2024");
  expect(formatReviewDate("viime viikolla", "en")).toBe("viime viikolla");
});
