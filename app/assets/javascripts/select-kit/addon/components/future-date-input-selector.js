import ComboBoxComponent from "select-kit/components/combo-box";
import DatetimeMixin from "select-kit/components/future-date-input-selector/mixin";
import I18n from "I18n";
import { computed } from "@ember/object";
import { equal } from "@ember/object/computed";
import { isEmpty } from "@ember/utils";
import {
  defaultShortcutOptions,
  timeShortcutOptions,
} from "discourse/lib/time-shortcut";

const TIMEFRAME_BASE = {
  enabled: () => true,
  when: () => null,
  icon: "briefcase",
  displayWhen: true,
};

function buildTimeframe(opts) {
  return jQuery.extend({}, TIMEFRAME_BASE, opts);
}

export const TIMEFRAMES = [
  buildTimeframe({
    id: "later_today",
    format: "h a",
    enabled: (opts) => opts.canScheduleLaterToday,
    when: (time) => time.hour(18).minute(0),
    icon: "far-moon",
  }),
  buildTimeframe({
    id: "tomorrow",
    format: "ddd, h a",
    when: (time, timeOfDay) => time.add(1, "day").hour(timeOfDay).minute(0),
    icon: "far-sun",
  }),
  buildTimeframe({
    id: "later_this_week",
    format: "ddd, h a",
    enabled: (opts) => opts.canScheduleLaterThisWeek,
    when: (time, timeOfDay) => time.add(2, "day").hour(timeOfDay).minute(0),
  }),
  buildTimeframe({
    id: "this_weekend",
    format: "ddd, h a",
    enabled: (opts) => opts.canScheduleThisWeekend,
    when: (time, timeOfDay) => time.day(6).hour(timeOfDay).minute(0),
    icon: "bed",
  }),
  buildTimeframe({
    id: "next_week",
    format: "ddd, h a",
    enabled: (opts) => opts.canScheduleNextWeek,
    when: (time, timeOfDay) =>
      time.add(1, "week").day(1).hour(timeOfDay).minute(0),
    icon: "briefcase",
  }),
  buildTimeframe({
    id: "two_weeks",
    format: "MMM D",
    when: (time, timeOfDay) => time.add(2, "week").hour(timeOfDay).minute(0),
    icon: "briefcase",
  }),
  buildTimeframe({
    id: "next_month",
    format: "MMM D",
    enabled: (opts) => opts.canScheduleNextMonth,
    when: (time, timeOfDay) =>
      time.add(1, "month").startOf("month").hour(timeOfDay).minute(0),
    icon: "briefcase",
  }),
  buildTimeframe({
    id: "two_months",
    format: "MMM D",
    when: (time, timeOfDay) =>
      time.add(2, "month").startOf("month").hour(timeOfDay).minute(0),
    icon: "briefcase",
  }),
  buildTimeframe({
    id: "three_months",
    format: "MMM D",
    when: (time, timeOfDay) =>
      time.add(3, "month").startOf("month").hour(timeOfDay).minute(0),
    icon: "briefcase",
  }),
  buildTimeframe({
    id: "four_months",
    format: "MMM D",
    when: (time, timeOfDay) =>
      time.add(4, "month").startOf("month").hour(timeOfDay).minute(0),
    icon: "briefcase",
  }),
  buildTimeframe({
    id: "six_months",
    format: "MMM D",
    when: (time, timeOfDay) =>
      time.add(6, "month").startOf("month").hour(timeOfDay).minute(0),
    icon: "briefcase",
  }),
  buildTimeframe({
    id: "one_year",
    format: "MMM D",
    enabled: (opts) => opts.includeFarFuture,
    when: (time, timeOfDay) =>
      time.add(1, "year").startOf("day").hour(timeOfDay).minute(0),
    icon: "briefcase",
  }),
  buildTimeframe({
    id: "forever",
    enabled: (opts) => opts.includeFarFuture,
    when: (time, timeOfDay) => time.add(1000, "year").hour(timeOfDay).minute(0),
    icon: "gavel",
    displayWhen: false,
  }),
  buildTimeframe({
    id: "pick_date_and_time",
    enabled: (opts) => opts.includeDateTime,
    icon: "far-calendar-plus",
  }),
];

let _timeframeById = null;

export function timeframeDetails(id) {
  if (!_timeframeById) {
    _timeframeById = {};
    TIMEFRAMES.forEach((t) => (_timeframeById[t.id] = t));
  }
  return _timeframeById[id];
}

export const FORMAT = "YYYY-MM-DD HH:mmZ";

export default ComboBoxComponent.extend(DatetimeMixin, {
  pluginApiIdentifiers: ["future-date-input-selector"],
  classNames: ["future-date-input-selector"],
  isCustom: equal("value", "pick_date_and_time"),

  selectKitOptions: {
    autoInsertNoneItem: false,
    headerComponent:
      "future-date-input-selector/future-date-input-selector-header",
  },

  modifyComponentForRow() {
    return "future-date-input-selector/future-date-input-selector-row";
  },

  content: computed("statusType", function () {
    // const now = moment();
    // const canScheduleLaterToday = 24 - now.hour() > 6;
    // const canScheduleLaterThisWeek = !canScheduleLaterToday && now.day() < 4;
    // const canScheduleThisWeekend = now.day() < 5 && this.includeWeekend;
    // const canScheduleNextWeek = now.day() !== 0;
    // const canScheduleNextMonth = now.date() !== moment().endOf("month").date();
    //
    // const opts = {
    //   includeFarFuture: this.includeFarFuture,
    //   includeDateTime: this.includeDateTime,
    //   canScheduleLaterToday: canScheduleLaterToday,
    //   canScheduleLaterThisWeek: canScheduleLaterThisWeek,
    //   canScheduleThisWeekend: canScheduleThisWeekend,
    //   canScheduleNextWeek: canScheduleNextWeek,
    //   canScheduleNextMonth: canScheduleNextMonth,
    // };

    let options = defaultShortcutOptions("UTC" /*userTimezone*/); // fixme use real timezone here and in tests

    const optionsBuilder = timeShortcutOptions("UTC"); // fixme use real timezone
    options.push(optionsBuilder.two_weeks());
    options.push(optionsBuilder.two_months());
    options.push(optionsBuilder.three_months());
    options.push(optionsBuilder.four_months());
    options.push(optionsBuilder.six_months());
    options.push(optionsBuilder.one_year());
    options.push(optionsBuilder.forever()); // fixme set displayWhen for forever to false

    // fixme make sorting shorter
    options.sort((a, b) => {
      if (a.time < b.time) {
        return -1;
      }
      if (a.time > b.time) {
        return 1;
      }
      return 0;
    });

    return options
      .filter((option) => !option.hidden)
      .map((option) => {
        return {
          id: option.id,
          name: I18n.t(option.label),
          datetime: option.time,
          icons: [option.icon],
        };
      });
  }),

  actions: {
    onChange(value) {
      if (value !== "pick_date_and_time") {
        const { time } = this._updateAt(value);
        if (time && !isEmpty(value)) {
          this.attrs.onChangeInput &&
            this.attrs.onChangeInput(time.locale("en").format(FORMAT));
        }
      }

      this.attrs.onChange && this.attrs.onChange(value);
    },
  },
});
