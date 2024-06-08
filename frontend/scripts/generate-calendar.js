const { writeFileSync } = require("fs");
const ics = require("ics");
const { fromZonedTime } = require("date-fns-tz");
const scheduleData = require("../src/data.json");

function generateICSCalendar(data, queue) {
  const today = Date.now();
  const events = Array.from({ length: 31 }).map((item, index) => {
    return data.data
      .find((item) => {
        return item.date.includes(
          new Date(today + index * 24 * 60 * 60 * 1000).getDate()
        );
      })
      .queue[queue - 1].schedule.map((item) => {
        const currentDate = new Date(today + index * 24 * 60 * 60 * 1000);
        const endTime = item.end === "24:00" ? "23:59" : item.end;

        const start = fromZonedTime(
          new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
            Number(item.start.split(":")[0]),
            Number(item.start.split(":")[1])
          ),
          "Europe/Kiev"
        );

        const end = fromZonedTime(
          new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
            Number(endTime.split(":")[0]),
            Number(endTime.split(":")[1])
          ),
          "Europe/Kiev"
        );

        return {
          calName: `Відключення електропостачання`,
          title: `Вимкнення світла`,
          url: "https://light-in-app.web.app/",
          start: [
            start.getFullYear(),
            start.getMonth() + 1,
            start.getDate(),
            start.getHours(),
            start.getMinutes(),
          ],
          end: [
            end.getFullYear(),
            end.getMonth() + 1,
            end.getDate(),
            end.getHours(),
            end.getMinutes(),
          ],
        };
      });
  });

  const { value } = ics.createEvents(events.flat(2));

  return value;
}

scheduleData.data[0].queue.forEach((item, index) => {
  writeFileSync(
    `${__dirname}/../build/${index + 1}.ics`,
    generateICSCalendar(scheduleData, index + 1)
  );
});
