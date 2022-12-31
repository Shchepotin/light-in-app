import { useEffect, useState } from "react";
import prependZero from "./utils/prepend-zero";
import scheduleData from "./data.json";
import scheduleDataMinus from "./data-minus.json";
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

function copyToClipboard(text: string) {
  const el = document.createElement("textarea");
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
}

function CalendarBlock() {
  const [isShow, setIsShow] = useState(false);
  const prefixUrl = window.location.origin;

  return (
    <div className="calendar-container">
      <div className="modal-link-container">
        <button
          type="button"
          className="modal-link"
          onClick={() => setIsShow((prevIsShow) => !prevIsShow)}
        >
          Додати в календар
        </button>
      </div>
      {isShow && (
        <div className="modal-content-container">
          <p>
            Знайдіть свою чергу на сайті{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://www.dtek-kem.com.ua/ua/shutdowns"
            >
              ДТЕК
            </a>{" "}
            і додайте відповідне посилання у свій календар.
          </p>
          <div>
            {scheduleData.data[0].queue.map((queue, index) => (
              <div key={index} className="input-block">
                <label htmlFor="">Черга №{index + 1}</label>
                <div className="input-sub-block">
                  <input
                    className="input-text"
                    type="input"
                    readOnly
                    value={`${prefixUrl}/${index + 1}.ics`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(`${prefixUrl}/${index + 1}.ics`)
                    }
                  >
                    Копіювати
                  </button>
                  <a
                    href={`${prefixUrl}/${index + 1}.ics`}
                    download="calendar.ics"
                  >
                    Завантажити
                  </a>
                </div>
              </div>
            ))}
          </div>
          <p>
            Інструкція для{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://support.google.com/calendar/answer/37118?hl=uk"
            >
              Google Calendar
            </a>
            ,{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://support.microsoft.com/uk-ua/office/%D1%96%D0%BC%D0%BF%D0%BE%D1%80%D1%82-%D0%BA%D0%B0%D0%BB%D0%B5%D0%BD%D0%B4%D0%B0%D1%80%D1%96%D0%B2-%D0%B4%D0%BE-outlook-8e8364e1-400e-4c0f-a573-fe76b5a2d379"
            >
              Microsoft Outlook
            </a>
            ,{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://support.apple.com/uk-ua/guide/iphone/iph3d1110d4/16.0/ios/16.0"
            >
              iOS
            </a>
            .
          </p>
          <p>
            У інших програмах шукайте можливість імпортувати календар з{" "}
            <strong>URL</strong> або <strong>.ics</strong> файлу.
          </p>
          <p>
            Якщо завантажити .ics файл (кнопкою "Заватажити") та імпортувати в
            календар, то він НЕ буде автоматично оновлюватись, а буде
            відображати тільки графік на 1 місяць.
          </p>
          <p>
            Якщо після підписки на календар він не з'явився у додатку, то
            перевірте чи активований він (у боковому меню)
          </p>
        </div>
      )}
    </div>
  );
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

function Schedule(props: {
  isRunTimers?: boolean;
  date: number;
  scheduleData: ScheduleDataType;
}) {
  const filteredSchedule = transformData(props.scheduleData).data.find((item) =>
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
  const isShowMinus = false;
  const isShowAlert = false;

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

      {isShowAlert && (
        <div className="alert-container">
          <div className="alert-content-container">
            <p>
              ❗️ Екстренне відключення у зв'язку з загрозою ракетного обстрілу.
            </p>
          </div>
        </div>
      )}

      <CalendarBlock />

      <div className="days-container">
        <div className="days-column">
          <h2 className="day-title">{`Сьогодні, ${new Date().toLocaleDateString()}`}</h2>
          <Schedule
            date={new Date().getDate()}
            scheduleData={scheduleData}
            isRunTimers
          />
          {isShowMinus && (
            <>
              <h3 className="day-title">Під час -10&#176;С та нижче</h3>
              <Schedule
                date={new Date().getDate()}
                scheduleData={scheduleDataMinus}
                isRunTimers
              />
            </>
          )}
        </div>
        <div className="days-column">
          <h2 className="day-title">
            {`Завтра, ${new Date(
              Date.now() + 1000 * 60 * 60 * 24
            ).toLocaleDateString()}`}
          </h2>
          <Schedule
            date={new Date(Date.now() + 1000 * 60 * 60 * 24).getDate()}
            scheduleData={scheduleData}
          />
          {isShowMinus && (
            <>
              <h3 className="day-title">Під час -10&#176;С та нижче</h3>
              <Schedule
                date={new Date(Date.now() + 1000 * 60 * 60 * 24).getDate()}
                scheduleData={scheduleDataMinus}
              />
            </>
          )}
        </div>
        <div className="days-column">
          <h2 className="day-title">
            {`Післязавтра, ${new Date(
              Date.now() + 1000 * 60 * 60 * 24 * 2
            ).toLocaleDateString()}`}
          </h2>
          <Schedule
            date={new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).getDate()}
            scheduleData={scheduleData}
          />
          {isShowMinus && (
            <>
              <h3 className="day-title">Під час -10&#176;С та нижче</h3>
              <Schedule
                date={new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).getDate()}
                scheduleData={scheduleDataMinus}
              />
            </>
          )}
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
