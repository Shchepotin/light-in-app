import { useEffect, useState } from "react";
import prependZero from "./utils/prepend-zero";
import scheduleData from "./data.json";
import { ReactComponent as ZapOnIcon } from "./images/zap-on.svg";
import { ReactComponent as ZapOffIcon } from "./images/zap-off.svg";

type ScheduleDataType = typeof scheduleData;

enum StatusEnum {
  NotDefined = 0,
  Active,
  Past,
}

function transformData(data: ScheduleDataType) {
  const result = { data: [...data.data] };

  result.data = result.data.map((item) => {
    return {
      ...item,
      queue: item.queue.map((queueItem) => {
        return {
          ...queueItem,
          schedule: queueItem.schedule.reduce(
            (accumulator, value, index, allSchedule) => {
              if (index === 0 && value.start !== "00:00") {
                accumulator = [
                  ...accumulator,
                  {
                    start: "00:00",
                    end: value.start,
                    isOn: true,
                  },
                ];
              }

              accumulator = [
                ...accumulator,
                {
                  ...value,
                  isOn: false,
                },
              ];

              if (value.end !== "24:00") {
                accumulator = [
                  ...accumulator,
                  {
                    start: value.end,
                    end: allSchedule[index + 1]?.start ?? "24:00",
                    isOn: true,
                  },
                ];
              }

              return accumulator;
            },
            [] as ScheduleDataType["data"]["0"]["queue"]["0"]["schedule"]["0"][]
          ),
        };
      }),
    };
  });

  return result;
}

function Row(props: {
  scheduleItem: ScheduleDataType["data"]["0"]["queue"]["0"]["schedule"]["0"];
  isRunTimers?: boolean;
}) {
  const getStatus = () => {
    const date = new Date();
    const currentTime =
      prependZero(date.getHours()) + ":" + prependZero(date.getMinutes());

    if (
      props.scheduleItem.start <= currentTime &&
      currentTime < props.scheduleItem.end
    ) {
      return StatusEnum.Active;
    }

    if (currentTime >= props.scheduleItem.end) {
      return StatusEnum.Past;
    }

    return StatusEnum.NotDefined;
  };

  const [status, setStatus] = useState(() =>
    props.isRunTimers ? getStatus() : 0
  );

  useEffect(() => {
    let timer: NodeJS.Timer;

    if (props.isRunTimers) {
      timer = setInterval(() => {
        setStatus(getStatus());
      }, 1000);
    }

    return () => {
      if (props.isRunTimers) {
        clearInterval(timer);
      }
    };
    // eslint-disable-next-line
  }, [props.isRunTimers]);

  return (
    <div
      className={[
        "schedule-row",
        props.scheduleItem.isOn && "in-on",
        !props.scheduleItem.isOn && "in-off",
        status === 1 && "active",
        status === 2 && "past",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="schedule-row-icon">
        {props.scheduleItem.isOn ? <ZapOnIcon /> : <ZapOffIcon />}{" "}
      </div>
      <div className="schedule-row-info">
        {props.scheduleItem.isOn
          ? status === 1
            ? "Увімкнено"
            : "Увімкнення"
          : status === 1
          ? "Вимкнено"
          : "Вимкнення"}{" "}
        з <strong>{props.scheduleItem.start}</strong> по{" "}
        <strong>{props.scheduleItem.end}</strong>
      </div>
    </div>
  );
}

function Schedule(props: { isRunTimers?: boolean; date: number }) {
  const filteredSchedule = transformData(scheduleData).data.find((item) =>
    item.date.includes(props.date)
  );

  return (
    <div className="schedule-wrapper">
      {filteredSchedule?.queue.map((queueItem, queueIndex) => (
        <div className="schedule-container" key={`${props.date}-${queueIndex}`}>
          <h3 className="schedule-title">{`Черга №${queueIndex + 1}`}</h3>
          {queueItem.schedule.map((scheduleItem, scheduleItemIndex) => (
            <Row
              key={`${props.date}-${scheduleItemIndex}-${queueIndex}-${scheduleItem.start}-${scheduleItem.end}`}
              scheduleItem={scheduleItem}
              isRunTimers={props.isRunTimers}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function App() {
  const [, setDate] = useState(() => new Date().getDate());

  useEffect(() => {
    const timer = setInterval(() => {
      setDate(new Date().getDate());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="app">
      <header>
        <h1 className="main-title">
          💡 Графік <span title="🍗 електрохарчування?">електропостачання</span>{" "}
          в м. Суми
        </h1>
      </header>
      <div className="days-container">
        <div className="days-column">
          <h2 className="day-title">{`Сьогодні, ${new Date().toLocaleDateString()}`}</h2>
          <Schedule date={new Date().getDate()} isRunTimers />
        </div>
        <div className="days-column">
          <h2 className="day-title">
            {`Завтра, ${new Date(
              Date.now() + 1000 * 60 * 60 * 24
            ).toLocaleDateString()}`}
          </h2>
          <Schedule
            date={new Date(Date.now() + 1000 * 60 * 60 * 24).getDate()}
          />
        </div>
        <div className="days-column">
          <h2 className="day-title">
            {`Післязавтра, ${new Date(
              Date.now() + 1000 * 60 * 60 * 24 * 2
            ).toLocaleDateString()}`}
          </h2>
          <Schedule
            date={new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).getDate()}
          />
        </div>
      </div>
      <footer className="footer">
        <p>
          <a target="_blank" rel="noreferrer" href="https://t.me/LightInApp">
            Telegram
          </a>{" "}
          канал додатку
        </p>
        <p>
          <a
            target="_blank"
            rel="noreferrer"
            href="https://github.com/Shchepotin/light-in-app"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
