import { type Request, chromium } from "playwright";

export async function getSubDivxParameter(): Promise<string> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let payloadData = "";

  // Intercept network requests
  page.on("request", (request: Request) => {
    if (request.url().includes("ajax.php")) {
      const postData = request.postData();

      if (postData) {
        payloadData = postData;
      }
    }
  });

  // Navigate to the site
  await page.goto("https://subdivx.com/");

  // Input the search term
  await page.fill("#buscar", "the wild robot");

  // Trigger the search
  await page.click("#btnSrch");

  // Wait for some time to ensure the request is captured
  await page.waitForTimeout(5000);

  // Close the browser
  await browser.close();

  const parameters = payloadData.split("&");
  const thirdParameter = parameters[2];
  const [key] = thirdParameter.split("=");

  return key;
}
