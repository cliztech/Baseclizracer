from playwright.sync_api import sync_playwright

def verify_mute_button():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:8080/v4.final.html")

            # Verify the button exists and is a button
            mute_btn = page.locator("#mute")

            # Check tag name using evaluate
            tag_name = mute_btn.evaluate("el => el.tagName")
            print(f"Tag name: {tag_name}")
            if tag_name != "BUTTON":
                print("Error: #mute is not a BUTTON")
                exit(1)

            # Check aria-label
            aria_label = mute_btn.get_attribute("aria-label")
            print(f"Aria label: {aria_label}")
            if aria_label != "Mute music":
                print("Error: aria-label is incorrect")
                exit(1)

            # Focus the button to check focus styles
            mute_btn.focus()

            # Take screenshot
            page.screenshot(path="verification/mute_button.png")
            print("Screenshot saved to verification/mute_button.png")

        finally:
            browser.close()

if __name__ == "__main__":
    verify_mute_button()
