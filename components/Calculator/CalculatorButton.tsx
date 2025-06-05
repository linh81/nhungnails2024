import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";

interface ButtonProps {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  disabled?: boolean;
  title: string;
  width?: number;
  height?: number;
  onPress?: () => {};
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: "#666",
    borderRadius: 4,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: 1,
  },
  button__text: {
    fontSize: 25,
  },

  // STATE
  "button--disabled": {
    opacity: 0.3,
  },
});

const Button: React.FC<ButtonProps> = ({
  backgroundColor = "#fff",
  textColor = "#000",
  borderColor,
  disabled = false,
  title = "",
  width = 72,
  height = 80,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          ...(!!backgroundColor ? { backgroundColor } : {}),
          ...(!!borderColor ? { borderColor } : {}),
          borderWidth: !!borderColor ? 2 : 0,
          // width,
          height,
          flex: 1,
        },
        disabled && styles["button--disabled"],
      ]}
      onPress={!disabled && onPress ? onPress : null}
      disabled={disabled}
    >
      <Text style={[styles.button__text, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
};

export default Button;
