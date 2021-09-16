import { AppWindow } from "../AppWindow";
import {
  OWGamesEvents,
  OWHotkeys
} from "@overwolf/overwolf-api-ts";
import { interestingFeatures, hotkeys, windowNames, tftClassId } from "../consts";
import WindowState = overwolf.windows.WindowStateEx;

// The window displayed in-game while a Fortnite game is running.
// It listens to all info events and to the game events listed in the consts.ts file
// and writes them to the relevant log using <pre> tags.
// The window also sets up Ctrl+F as the minimize/restore hotkey.
// Like the background window, it also implements the Singleton design pattern.
class InGame extends AppWindow {
  private static _instance: InGame;
  private _tftGameEventsListener: OWGamesEvents;
  private _eventsLog: HTMLElement;
  private _infoLog: HTMLElement;
  private _plugin: any;

  private constructor() {
    super(windowNames.inGame);

    this._eventsLog = document.getElementById('eventsLog');
    this._infoLog = document.getElementById('infoLog');

    this.setToggleHotkeyBehavior();
    this.setToggleHotkeyText();

    this._tftGameEventsListener = new OWGamesEvents({
      onInfoUpdates: this.onInfoUpdates.bind(this),
      onNewEvents: this.onNewEvents.bind(this)
    },
      interestingFeatures);

    overwolf.extensions.current.getExtraObject("RoundByRoundPlugin", (result) => {
      if (result.success === true) {
        this._plugin = result.object;
        console.log("Plugin loaded, fck yeah!");
      } else {
        console.log("Plugin not loaded!");
      }
    });
  }

  public static instance() {
    if (!this._instance) {
      this._instance = new InGame();
    }

    return this._instance;
  }

  public run() {
    this._tftGameEventsListener.start();
  }

  private onInfoUpdates(info) {
    this.logLine(this._infoLog, info, false);
  }

  // Special events will be highlighted in the event log
  private onNewEvents(e) {

    if(this._plugin) {
      this._plugin.get().LiveEvent(e, function(result) {
        console.log(result);
      });
    }

    const shouldHighlight = e.events.some(event => {
      return true;
    });
     
    console.log(e);
    this.logLine(this._eventsLog, e, shouldHighlight);
  }

  // Displays the toggle minimize/restore hotkey in the window header
  private async setToggleHotkeyText() {
    const hotkeyText = await OWHotkeys.getHotkeyText(hotkeys.toggle, tftClassId);
    const hotkeyElem = document.getElementById('hotkey');
    hotkeyElem.textContent = hotkeyText;
  }

  // Sets toggleInGameWindow as the behavior for the Ctrl+F hotkey
  private async setToggleHotkeyBehavior() {
    const toggleInGameWindow = async (hotkeyResult: overwolf.settings.hotkeys.OnPressedEvent): Promise<void> => {
      console.log(`pressed hotkey for ${hotkeyResult.name}`);
      const inGameState = await this.getWindowState();

      if (inGameState.window_state === WindowState.NORMAL ||
        inGameState.window_state === WindowState.MAXIMIZED) {
        this.currWindow.minimize();
      } else if (inGameState.window_state === WindowState.MINIMIZED ||
        inGameState.window_state === WindowState.CLOSED) {
        this.currWindow.restore();
      }
    }

    OWHotkeys.onHotkeyDown(hotkeys.toggle, toggleInGameWindow);
  }

  // Appends a new line to the specified log
  private logLine(log: HTMLElement, data, highlight) {
    console.log(`${log.id}:`);
    console.log(data);
    const line = document.createElement('pre');
    line.textContent = JSON.stringify(data);

    if (highlight) {
      line.className = 'highlight';
    }

    const shouldAutoScroll = (log.scrollTop + log.offsetHeight) > (log.scrollHeight - 10);

    log.appendChild(line);

    if (shouldAutoScroll) {
      log.scrollTop = log.scrollHeight;
    }
  }
}

InGame.instance().run();
