from playwright.sync_api import sync_playwright
import time

def verify_race_state():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Player 1
        page1 = browser.new_page()
        page1.goto("http://localhost:8081/v4.final.html")
        page1.fill("#input_name", "Maverick")
        page1.fill("#input_room", "TopGun")
        page1.click("#btn_join")

        # Wait for WAITING state (0)
        print("P1: Waiting for WAITING state...")
        page1.wait_for_function("() => window.networkManager && window.networkManager.raceState === 0")

        # Wait for render blink (might be invisible if caught during off-blink, but we'll try)
        # It blinks every 800ms.
        time.sleep(1)

        # Screenshot WAITING
        page1.screenshot(path="/home/jules/verification/waiting.png")
        print("P1: WAITING screenshot taken.")

        # Player 2
        print("P2: Joining...")
        page2 = browser.new_page()
        page2.goto("http://localhost:8081/v4.final.html")
        page2.fill("#input_name", "Goose")
        page2.fill("#input_room", "TopGun")
        page2.click("#btn_join")

        # Wait for COUNTDOWN (State 1) on Page 1
        print("P1: Waiting for COUNTDOWN...")
        page1.wait_for_function("() => window.networkManager.raceState === 1")

        # Wait a bit for the overlay "GET READY"
        time.sleep(0.5)

        page1.screenshot(path="/home/jules/verification/countdown.png")
        print("P1: COUNTDOWN screenshot taken.")

        browser.close()

if __name__ == "__main__":
    verify_race_state()
