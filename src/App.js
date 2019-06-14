import React from "react";
import "./App.css";

export default class App extends React.Component {
  constructor() {
    super();

    this.state = {
      time: 0,
      direction: -0,
      stopTime: 30 * 1e3,
      last: Date.now(),
      isPauseMenuOpen: false,
      isTimerMenuOpen: false,
    };

    this.bindListeners();
  }

  bindListeners() {
    this.startOrReverseTimer = this.startOrReverseTimer.bind(this);
    this.updateTime = this.updateTime.bind(this);
    this.pause = this.pause.bind(this);
    this.resume = this.resume.bind(this);
    this.openTimerMenu = this.openTimerMenu.bind(this);
    this.closeTimerMenu = this.closeTimerMenu.bind(this);
    this.resetTimer = this.resetTimer.bind(this);
    this.setPendingStopTime = this.setPendingStopTime.bind(this);
    this.populatePendingStopTime = this.populatePendingStopTime.bind(this);
    this.applyAndClearPendingStopTime = this.applyAndClearPendingStopTime.bind(
      this
    );
  }

  render() {
    const { time, stopTime } = this.state;
    if (Math.abs(time) < stopTime) {
      return this.renderRunning();
    } else {
      return this.renderStopped();
    }
  }

  renderRunning() {
    const { time } = this.state;
    const sign = time < 0 ? "-" : "+";
    return (
      <div className={`App App--${this.color()}`}>
        <div className="Time" onClick={this.startOrReverseTimer}>
          {sign}
          {timeString(time)}
        </div>

        {this.state.direction === 0 ? (
          <div className="PauseMenu">
            <CircleButton text="▶" onClick={this.resume} />
            <CircleButton
              text="1:23"
              smallTextEnabled
              onClick={this.openTimerMenu}
            />
          </div>
        ) : (
          <div className="OpenPauseMenuButtonContainer">
            <CircleButton text="||" onClick={this.pause} />
          </div>
        )}

        {this.state.isTimerMenuOpen && (
          <div className="TimerMenu">
            <div className="CloseTimerMenuButtonContainer">
              <CircleButton text="X" onClick={this.closeTimerMenu} />
            </div>
            <label>
              Stop time:
              <input
                type="text"
                value={this.state.pendingStopTime}
                onChange={this.setPendingStopTime}
                onFocus={this.populatePendingStopTime}
                onBlur={this.applyAndClearPendingStopTime}
              />
            </label>
            <span>
              Reset current time
              <CircleButton text="↺" onClick={this.resetTimer} />
            </span>
          </div>
        )}
      </div>
    );
  }

  renderStopped() {
    const { time, stopTime } = this.state;
    const sign = time < 0 ? "-" : "+";
    return (
      <div className={`App App--${this.color()}`}>
        <div className="Time Time--stopped">
          {sign}
          {timeString(stopTime)}
        </div>

        <div className="ResetStoppedTimerButtonContainer">
          <CircleButton text="↺" onClick={this.resetTimer} />
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.updateTime();
  }

  startOrReverseTimer() {
    if (this.state.direction === 0) {
      this.setState({
        direction: nonZeroSign(this.state.direction),
        last: Date.now(),
      });
    } else {
      this.setState((prevState) => ({
        direction: -prevState.direction,
        last: Date.now(),
      }));
    }
  }

  updateTime() {
    requestAnimationFrame(this.updateTime);
    this.setState((prevState) => {
      const now = Date.now();
      const delta = now - prevState.last;
      return {
        time: prevState.time + delta * prevState.direction,
        last: now,
      };
    });
  }

  pause() {
    this.setState({
      direction: zeroFromSign(this.state.direction),
    });
  }

  resume() {
    this.setState({
      direction: nonZeroSign(this.state.direction),
    });
  }

  openTimerMenu() {
    this.setState({
      isTimerMenuOpen: true,
      pendingStopTime: timeString(this.state.stopTime),
    });
  }

  closeTimerMenu() {
    this.setState({ isTimerMenuOpen: false });
  }

  resetTimer() {
    this.setState({
      time: 0,
      direction: -0,
      isTimerMenuOpen: false,
    });
  }

  setPendingStopTime(e) {
    this.setState({
      pendingStopTime: e.target.value,
    });
  }

  populatePendingStopTime() {
    this.setState({
      pendingStopTime: timeString(this.state.stopTime),
    });
  }

  applyAndClearPendingStopTime() {
    const stopTime =
      parseTime(this.state.pendingStopTime) || this.state.stopTime;

    this.setState({
      pendingStopTime: timeString(stopTime),
      stopTime,
    });
  }

  color() {
    if (nonZeroSign(this.state.direction) > 0) {
      return "black";
    } else {
      return "white";
    }
  }
}

function CircleButton({ onClick, smallTextEnabled = false, text }) {
  return (
    <button
      className={
        "CircleButton" + (smallTextEnabled ? " CircleButton--small-text" : "")
      }
      onClick={onClick}
    >
      {text}
    </button>
  );
}

function leftpadSeconds(str) {
  if (str.length === 2) {
    return str;
  } else {
    return "0" + str;
  }
}

function nonZeroSign(number) {
  if (number > 0) {
    return 1;
  } else if (number < 0) {
    return -1;
  } else if (Object.is(-0, number)) {
    return -1;
  } else {
    return 1;
  }
}

function zeroFromSign(sign) {
  if (sign > 0) {
    return +0;
  } else if (sign < 0) {
    return -0;
  } else {
    throw new TypeError("Sign must be either greater than or less than zero.");
  }
}

function timeString(millis) {
  const totalSeconds = Math.floor(Math.abs(millis) * 1e-3);
  const minutes = "" + Math.floor(totalSeconds / 60);
  const seconds = leftpadSeconds("" + (totalSeconds % 60));
  return minutes + ":" + seconds;
}

function parseTime(str) {
  if ("infinity" === str.toLowerCase()) {
    return Infinity;
  }

  const split = str.split(":");
  if (split.length === 2) {
    const [minStr, secStr] = split;
    const [minutes, seconds] = [parseInt(minStr, 10), parseFloat(secStr, 10)];
    return 1e3 * (minutes * 60 + seconds);
  } else {
    return NaN;
  }
}
