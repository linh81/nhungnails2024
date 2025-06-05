import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

import CalculatorButtonGrid from "./CalculatorButtonGrid";
import { Ionicons } from "@expo/vector-icons";
import {
  Checkbox,
  Colors,
  SortableList,
  TextField,
  Text,
  View,
} from "react-native-ui-lib";
import ListItem from "@/components/ListItem";

const presetValues = [
  10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 5, 15, 25, 35, 45, 55, 65, 75, 85,
  95,
];
const singleDigits = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
const presetButtonColors = [
  "#e6194B",
  "#f58231",
  "#ffe119",
  "#bfef45",
  "#3cb44b",
  "#42d4f4",
  "#4363d8",
  "#911eb4",
  "#f032e6",
  "#fabed4",
  "#bfef45",
  "#3cb44b",
  "#ffe119",
  "#f58231",
  "#e6194B",
  "#fabed4",
  "#f032e6",
  "#911eb4",
  "#4363d8",
  "#42d4f4",
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2980B9",
    paddingBottom: 20,
    paddingTop: 56,
  },
  displayContainer: {
    flex: 1,
    backgroundColor: "#fff",
    flexDirection: "column",
    alignSelf: "stretch",
    margin: 3,
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: "flex-end",
  },
  formula: {
    alignSelf: "flex-start",
    flex: 1,
    fontSize: 18,
    padding: 10,
    lineHeight: 24,
  },
  resultContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  result: {
    alignSelf: "flex-end",
    fontSize: 40,
    paddingHorizontal: 12,
    height: 50,
  },
  numberOfFormulaParts: {
    alignSelf: "flex-end",
    fontSize: 16,
    paddingHorizontal: 12,
    height: 32,
  },
  middleButtons: {
    flexDirection: "row",
  },
  presetButtons: { flex: 1 },
  priorityButtons: {
    flexDirection: "column",
    width: 60,
  },
  singleDigitButtons: {
    marginTop: 5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export function getSum(formula: string) {
  if (!formula) return 0;

  return formula
    .split("+")
    .filter((number) => number !== "")
    .reduce((sum, number) => {
      const parsedNumber = parseInt(number, 10);
      // Protect against NaN values
      return sum + (Number.isFinite(parsedNumber) ? parsedNumber : 0);
    }, 0);
}

export function getNewFormula(
  formula: string,
  valueToAdd: string,
  autoPlus: boolean
) {
  if (valueToAdd === "+" && (formula.slice(-1) === "+" || formula === ""))
    return null;

  let newFormula = "";
  if (formula !== "" && autoPlus && formula.slice(-1) !== "+") {
    newFormula = `${formula}+${valueToAdd}`;
  } else {
    newFormula = `${formula}${valueToAdd}`;
  }

  return newFormula;
}

const Calculator = ({
  onSubmit,
  onClose,
  formula: initialFormula,
  result: initialResult,
  isAtmVerified: initialIsAtmVerified,
  headerTitle,
}: {
  onSubmit: any;
  onClose: any;
  formula: string;
  result: number;
  isAtmVerified: boolean | null;
  headerTitle: string;
}) => {
  const [formula, setFormula] = useState(initialFormula || "");
  const [result, setResult] = useState(String(initialResult) || "0");
  const [isAtmVerified, setIsAtmVerified] = useState(
    typeof initialIsAtmVerified === "boolean" ? initialIsAtmVerified : null
  );
  const [reorderedList, setReorderedList] = useState<any>();
  const [cursorPosition, setCursorPosition] = useState(0);

  useEffect(() => {
    const calculatedSum = getSum(formula);
    const safeResult = Number.isFinite(calculatedSum) ? calculatedSum.toString() : "0";
    setResult(safeResult);
  }, [formula]);

  const reset = () => {
    // playButtonSound();
    setFormula("");
    setCursorPosition(0);
    // setResult("0");
  };

  const handleBackSpace = () => {
    if (formula === "" || cursorPosition === 0) return;
    // playButtonSound();
    const newFormula = formula.slice(0, cursorPosition - 1) + formula.slice(cursorPosition);
    setFormula(newFormula);
    setCursorPosition(cursorPosition - 1);
    // setResult(getSum(newFormula).toString());
  };

  const addToFormula = (value: string, autoPlus = false) => {
    let insertValue = value;

    // Handle autoPlus logic
    if (autoPlus && cursorPosition > 0 && formula[cursorPosition - 1] !== "+") {
      insertValue = "+" + value;
    }

    // Don't add + if it would create double plus or if at start
    if (value === "+" && (cursorPosition === 0 || formula[cursorPosition - 1] === "+")) {
      return;
    }

    const newFormula = formula.slice(0, cursorPosition) + insertValue + formula.slice(cursorPosition);
    setFormula(newFormula);
    setCursorPosition(cursorPosition + insertValue.length);
  };

  const submitResult = () => {
    const numericResult = Number(result);
    const safeResult = Number.isFinite(numericResult) ? numericResult : 0;
    onSubmit({ formula, result: safeResult, isAtmVerified });
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  const handleDeleteValue = (indexToDelete: number) => {
    const newFormula = formula
      .split("+")
      .filter((_value, index) => index !== indexToDelete)
      .join("+");
    setFormula(newFormula);
    setCursorPosition(Math.min(cursorPosition, newFormula.length));
  };

  const handleInvertOrder = () => {
    if (!formula) return;
    const newFormula = formula.split("+").reverse().join("+");
    setFormula(newFormula);
    setCursorPosition(Math.min(cursorPosition, newFormula.length));
  };

  const handleUpdateValue = (value: number, index: number) => {
    const newFormula = formula
      .split("+")
      .map((item, idx) => (idx === index ? value : item))
      .join("+");
    setFormula(newFormula);
    setCursorPosition(Math.min(cursorPosition, newFormula.length));
  };

  // Input filtering for formula TextField - only numbers and + sign
  const handleFormulaTextChange = (text: string) => {
    // Only allow numbers and + sign
    const filteredText = text.replace(/[^0-9+]/g, '');
    setFormula(filteredText);
  };

  // Handle cursor position changes
  const handleSelectionChange = (event: any) => {
    setCursorPosition(event.nativeEvent.selection.start);
  };

  const renderPresetButtons = () => {
    const buttons = presetValues.map((value, index) => ({
      title: value.toString(),
      onPress: () => addToFormula(value.toString(), true),
      backgroundColor: presetButtonColors[index] || "",
      borderColor: "#fff",
      textColor: "#000",
      height: 80,
      width: 59,
    }));

    return (
      <CalculatorButtonGrid
        maxHorizontalItems={5}
        buttons={buttons}
        style={styles.presetButtons}
      />
    );
  };

  const renderPriorityButtons = () => {
    const buttons = [
      { title: "C", onPress: reset },
      { title: "<", onPress: handleBackSpace },
      { title: "+", onPress: () => addToFormula("+") },
      { title: "💾", onPress: submitResult },
    ].map(({ title, onPress }) => ({
      title,
      onPress,
      backgroundColor: "#999",
      borderColor: "#333",
      textColor: "#eee",
      height: 80,
      width: 59,
    }));

    return (
      <CalculatorButtonGrid
        style={styles.priorityButtons}
        maxHorizontalItems={1}
        buttons={buttons}
      />
    );
  };

  const renderSingleDigitButtons = () => {
    const buttons = singleDigits.map((value) => ({
      title: value.toString(),
      onPress: () => addToFormula(value.toString()),
      backgroundColor: "#eee",
      borderColor: "#666",
      height: 60,
    }));

    return (
      <CalculatorButtonGrid
        style={styles.singleDigitButtons}
        maxHorizontalItems={5}
        buttons={buttons}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#2980B9",
          paddingLeft: 16,
          paddingRight: 8,
        }}
      >
        <Ionicons
          name="close"
          size={40}
          onPress={handleClose}
          color={"red"}
          style={{ backgroundColor: "#2980B9" }}
        />
        <View style={{ backgroundColor: "#2980B9" }}>
          <Text style={{ fontSize: 18, color: "#fff" }}>{headerTitle}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#2980B9" }}>
          {!!formula && (
            <Ionicons
              name="swap-vertical-outline"
              size={28}
              onPress={handleInvertOrder}
              color="#fff"
              style={{ backgroundColor: "#2980B9" }}
            />
          )}
          <Checkbox
            value={isAtmVerified || false}
            color="#fff"
            iconColor="green"
            onValueChange={(value) => {
              setIsAtmVerified(value);
            }}
            containerStyle={{ backgroundColor: "#2980B9", marginLeft: 8 }}
          />

        </View>
      </View>
      <View style={styles.displayContainer}>

        <ScrollView>
          <TextField
            value={formula}
            style={styles.formula}
            onChangeText={handleFormulaTextChange}
            multiline
            showSoftInputOnFocus={false}
            onSelectionChange={handleSelectionChange}
            selection={{ start: cursorPosition, end: cursorPosition }}
          />
        </ScrollView>
        <View style={styles.resultContainer}>
          <Text style={styles.numberOfFormulaParts}>
            ({Math.max(0, formula.split("+").filter((value) => !!value).length)}x)
          </Text>
          <Text style={styles.result}>{result}</Text>
        </View>

      </View>
      <View
        style={[styles.middleButtons, { backgroundColor: "transparent" }]}
      >
        {renderPresetButtons()}
        {renderPriorityButtons()}
      </View>

      {renderSingleDigitButtons()}

    </View>
  );
};

export default Calculator;
