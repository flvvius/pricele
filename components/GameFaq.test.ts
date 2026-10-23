import { describe, expect, it } from "vitest";
import { gameQuestions } from "./GameFaq";

describe("gameQuestions", () => {
  it("links a phrase that appears exactly once in its answer", () => {
    for (const q of gameQuestions("Open Range", "A daily game.", "Prices come from surveys")) {
      if (q.link) expect(q.answer.split(q.link.phrase)).toHaveLength(2);
    }
  });
});
