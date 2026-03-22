import { expect, test } from "@playwright/test";

type RouteExpectation = {
  path: string;
  heading: RegExp;
  text: string;
};

const routes: RouteExpectation[] = [
  {
    path: "/",
    heading: /^Girk$/,
    text: "Girk helps you make simple websites, docs, or even book-like sites from Markdown.",
  },
  {
    path: "/about/",
    heading: /^About$/,
    text: "A project by Sil",
  },
  {
    path: "/docs/",
    heading: /^Docs$/,
    text: "You can use Girk in any folder where there are markdown files.",
  },
  {
    path: "/docs/archive/",
    heading: /^Archives$/,
    text: "You can create archives in specific types",
  },
  {
    path: "/docs/media/",
    heading: /^Media and Assets$/,
    text: "these will automatically be copied to your project",
  },
  {
    path: "/docs/meta/",
    heading: /^Meta$/,
    text: "projectGroupTags",
  },
  {
    path: "/docs/partials/",
    heading: /^Partials$/,
    text: "By adding a - in front of the filename",
  },
  {
    path: "/docs/project-settings/",
    heading: /^Project Settings$/,
    text: "projectTitle: My Project Title",
  },
  {
    path: "/docs/settings/",
    heading: /^Settings$/,
    text: "Girk does not support any settings from the cli.",
  },
  {
    path: "/docs/styling/",
    heading: /^Styling$/,
    text: "In the custom file, you can redefine all the used colors",
  },
  {
    path: "/docs/examples/",
    heading: /^Examples$/,
    text: "Deployable Examples",
  },
  {
    path: "/docs/kitchensink/",
    heading: /^Header 123$/,
    text: "This is an example link.",
  },
];

test.describe("generated docs", () => {
  test("homepage and primary docs routes have the expected titles", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/^Girk$/);

    await page.goto("/about/");
    await expect(page).toHaveTitle(/^About \| Girk$/);

    await page.goto("/docs/");
    await expect(page).toHaveTitle(/^Documentation \| Girk$/);
  });

  for (const route of routes) {
    test(`renders ${route.path}`, async ({ page }) => {
      const response = await page.goto(route.path);

      expect(response?.ok()).toBeTruthy();
      await expect(page.getByRole("heading", { level: 1, name: route.heading })).toBeVisible();
      await expect(page.locator("main")).toContainText(route.text);
    });
  }

  test("renders /temp/ as an empty but reachable page", async ({ page }) => {
    const response = await page.goto("/temp/");

    expect(response?.ok()).toBeTruthy();
    await expect(page.locator("main")).toContainText("Documentation");
    await expect(page.locator(".navigation__item--current").first()).toContainText("temp");
  });

  test("navigation links stay reachable from the homepage", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("banner").getByRole("link", { name: "Documentation" }).click();
    await expect(page).toHaveURL(/\/docs(?:\/|\/index\.html)?$/);
    await expect(page.getByRole("heading", { level: 1, name: "Docs" })).toBeVisible();

    await page.getByRole("banner").getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL(/\/about(?:\/|\/index\.html)?$/);
    await expect(page.getByRole("heading", { level: 1, name: "About" })).toBeVisible();
  });

  test("docs landing page exposes child docs as visible links", async ({ page }) => {
    await page.goto("/docs/");

    await expect(page.getByRole("link", { name: "Archives" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Examples" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Media and Assets" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Project Settings" })).toBeVisible();
  });
});
