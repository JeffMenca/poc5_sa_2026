import { describe, expect, it } from "vitest";
import { dedent, locateSymbol } from "./excerpt";

const SOURCE = `import { thing } from "somewhere";

export const STEPS = [
  { name: "a" },
  { name: "b" },
];

type Mode = "on" | "off";

export class Saga {
  private readonly items = new Set<string>();

  async place(request: Request): Promise<Order> {
    if (request.label === "}") return order;
    for (const step of steps) {
      run(step);
    }
    return order;
  }

  private cancel(order: Order): void {
    order.status = "CANCELLED";
  }
}`.split("\n");

describe("locateSymbol", () => {
  it("finds a multi-line constant up to its closing bracket", () => {
    expect(locateSymbol(SOURCE, "STEPS")).toEqual({ start: 2, end: 5 });
  });

  it("finds a single-line type alias", () => {
    expect(locateSymbol(SOURCE, "Mode")).toEqual({ start: 7, end: 7 });
  });

  it("finds a method and ignores braces inside strings", () => {
    expect(locateSymbol(SOURCE, "place")).toEqual({ start: 12, end: 18 });
  });

  it("finds a method with modifiers", () => {
    expect(locateSymbol(SOURCE, "cancel")).toEqual({ start: 20, end: 22 });
  });

  it("finds a whole class", () => {
    expect(locateSymbol(SOURCE, "Saga")).toEqual({ start: 9, end: 23 });
  });

  it("fails loudly when the symbol does not exist", () => {
    expect(() => locateSymbol(SOURCE, "missing")).toThrow('Symbol "missing" not found');
  });
});

describe("dedent", () => {
  it("removes the indentation shared by every non-empty line", () => {
    expect(dedent(["    a()", "", "      b()"])).toEqual(["a()", "", "  b()"]);
  });
});
