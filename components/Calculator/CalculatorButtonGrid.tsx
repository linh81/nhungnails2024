import React from "react";
import { View, StyleSheet } from "react-native";
import CalculatorButton from "./CalculatorButton";

interface ButtonGridProps {
  buttons: {
    backgroundColor: string;
    borderColor: string;
    height: number;
    onPress: () => void;
    textColor?: string;
    title: string;
  }[];
  maxHorizontalItems: number;
  style?: any;
}

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

const ButtonGrid: React.FC<ButtonGridProps> = ({
  buttons = [],
  maxHorizontalItems = 4,
  style = null,
}) => {
  const gridButtons: any[] = buttons.reduce((result: any, button: any) => {
    const lastRow = result[result.length - 1];
    if (lastRow && lastRow.length < maxHorizontalItems) {
      lastRow.push(button);
      return result;
    }

    return [...result, [button]];
  }, []);

  return (
    <View style={style}>
      {gridButtons.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.buttonRow}>
          {row.map((button: any, buttonIndex: number) => {
            const {
              backgroundColor,
              borderColor,
              height,
              width,
              onPress,
              textColor,
              title,
            } = button;
            return (
              <CalculatorButton
                key={buttonIndex}
                title={title.toString()}
                onPress={onPress}
                backgroundColor={backgroundColor}
                borderColor={borderColor}
                textColor={textColor}
                height={height}
                width={width}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
};

export default ButtonGrid;
