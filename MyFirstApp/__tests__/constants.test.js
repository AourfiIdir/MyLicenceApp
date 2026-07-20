import { colors, sharedStyles } from "../constants/styles";

describe("colors", () => {
  it("should have all required color definitions", () => {
    expect(colors.primary).toBeDefined();
    expect(colors.secondary).toBeDefined();
    expect(colors.accent).toBeDefined();
    expect(colors.danger).toBeDefined();
    expect(colors.background).toBeDefined();
    expect(colors.card).toBeDefined();
    expect(colors.text).toBeDefined();
    expect(colors.textLight).toBeDefined();
    expect(colors.border).toBeDefined();
    expect(colors.borderLight).toBeDefined();
  });

  it("should have valid hex color values", () => {
    const hexColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
    Object.values(colors).forEach((color) => {
      expect(color).toMatch(hexColorRegex);
    });
  });
});

describe("sharedStyles", () => {
  it("should have container style with correct background", () => {
    expect(sharedStyles.container.backgroundColor).toBe(colors.background);
  });

  it("should have formCard with correct border", () => {
    expect(sharedStyles.formCard.borderWidth).toBe(4);
    expect(sharedStyles.formCard.borderColor).toBe(colors.border);
  });

  it("should have button with correct properties", () => {
    expect(sharedStyles.button.borderWidth).toBe(4);
    expect(sharedStyles.button.borderRadius).toBe(12);
  });
});
