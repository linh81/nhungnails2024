import React from "react";
import { StyleSheet } from "react-native";
import { Text, WheelPicker, View } from "react-native-ui-lib";
import { padStart } from "../utils/stringUtils";

interface TimePickerProps {
  hours?: any[];
  minutes?: any[];
  onHoursValueChange: (value: number) => void;
  onMinutesValueChange: (value: number) => void;
  selectedHours?: number;
  selectedMinutes?: number;
}
const styles = StyleSheet.create({
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});

const DEFAULT_HOURS = Array.from(Array(24).keys()).map((hour) => ({
  label: hour.toString(),
  value: hour,
})); // 0, 1, 2 ... 21, 22, 23
const DEFAULT_MINUTES = Array.from(
  { length: 60 / 5 },
  (_value, key) => key * 5
).map((minute) => ({
  label: padStart(minute.toString(), 2, "0"),
  value: minute,
})); // 0, 5, 10 ... 45, 50, 55

const TimePicker: React.FC<TimePickerProps> = ({
  hours = DEFAULT_HOURS,
  minutes = DEFAULT_MINUTES,
  onHoursValueChange,
  onMinutesValueChange,
  selectedHours = 0,
  selectedMinutes = 0,
}) => {
  return (
    <View style={styles.pickerContainer}>
      <WheelPicker
        numberOfVisibleRows={3}
        initialValue={selectedHours}
        onChange={onHoursValueChange}
        items={hours}
        style={{ width: 80 }}
        itemHeight={36}
      />
      <Text>:</Text>
      <WheelPicker
        numberOfVisibleRows={3}
        initialValue={selectedMinutes}
        onChange={onMinutesValueChange}
        items={minutes}
        style={{ width: 80 }}
        itemHeight={36}
      />
    </View>
  );
};

export default TimePicker;
