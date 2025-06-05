import { ScrollView, StyleSheet } from "react-native";

import CalculatorButtonGrid from "./CalculatorButtonGrid";
import { useEffect, useState } from "react";
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
    .reduce((sum, number) => sum + parseInt(number, 10), 0);
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [reorderedList, setReorderedList] = useState<any>();

  useEffect(() => {
    setResult(getSum(formula).toString());
  }, [formula]);

  const reset = () => {
    // playButtonSound();
    setFormula("");
    // setResult("0");
  };

  const handleBackSpace = () => {
    if (formula === "") return;
    // playButtonSound();
    const newFormula = formula.slice(0, -1);
    setFormula(newFormula);
    // setResult(getSum(newFormula).toString());
  };

  const addToFormula = (value: string, autoPlus = false) => {
    setFormula((formula) => `${formula}+${value}`);
    const newFormula = getNewFormula(formula, value, autoPlus);
    if (!newFormula) return;
    // playButtonSound();
    setFormula(newFormula);
    // setResult(getSum(newFormula).toString());
  };

  const submitResult = () => {
    onSubmit({ formula, result: Number(result), isAtmVerified });
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
  };

  const handleExitEditMode = () => {
    if (reorderedList) {
      const newFormula = reorderedList.map((item: any) => item.value).join("+");
      setFormula(newFormula);
    }
    setIsEditMode(false);
  };

  const handleInvertOrder = () => {
    if (!formula) return;
    const newFormula = formula.split("+").reverse().join("+");
    setFormula(newFormula);
  };

  const handleUpdateValue = (value: number, index: number) => {
    const newFormula = formula
      .split("+")
      .map((item, idx) => (idx === index ? value : item))
      .join("+");
    setFormula(newFormula);
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
          onPress={!isEditMode ? handleClose : () => {}}
          color={!isEditMode ? "red" : "#2980B9"}
          style={{ backgroundColor: "#2980B9" }}
        />
        <View style={{ backgroundColor: "#2980B9" }}>
          <Text style={{ fontSize: 18, color: "#fff" }}>{headerTitle}</Text>
        </View>
        <View style={{ flexDirection: "row", backgroundColor: "#2980B9" }}>
          {!!formula && (
            <>
              <Ionicons
                name="swap-vertical-outline"
                size={28}
                onPress={handleInvertOrder}
                color="#fff"
                style={{ backgroundColor: "#2980B9" }}
              />
              <Ionicons
                name={isEditMode ? "exit" : "pencil"}
                size={24}
                onPress={() =>
                  isEditMode ? handleExitEditMode() : setIsEditMode(true)
                }
                color="#fff"
                style={{ backgroundColor: "#2980B9", marginLeft: 8 }}
              />
            </>
          )}
          {isAtmVerified !== null && !isEditMode && (
            <Checkbox
              value={isAtmVerified}
              color="#fff"
              iconColor="green"
              onValueChange={(value) => {
                setIsAtmVerified(value);
              }}
              containerStyle={{ backgroundColor: "#2980B9", marginLeft: 8 }}
            />
          )}
        </View>
      </View>
      <View style={styles.displayContainer}>
        {isEditMode ? (
          !!formula ? (
            <SortableList
              data={formula
                .split("+")
                .map((value, index) => ({ value, id: String(index) }))}
              onOrderChange={setReorderedList}
              renderItem={({ item, index }) => (
                <ListItem
                  mainComponent={
                    <View
                      style={
                        {
                          // alignItems: "center",
                        }
                      }
                    >
                      <TextField
                        value={item.value}
                        style={{
                          fontSize: 18,
                          width: 60,
                          height: 20,
                          borderWidth: 1,
                          borderColor: "#dedede",
                        }}
                        onChangeText={(text) =>
                          handleUpdateValue(Number(text), index)
                        }
                        keyboardType="number-pad"
                      />
                      {/* <Text style={{ fontSize: 18 }}>{item.value}</Text> */}
                    </View>
                  }
                  rightComponent={
                    <Ionicons
                      name="close"
                      color="red"
                      size={32}
                      onPress={() => handleDeleteValue(index)}
                    />
                  }
                  style={{
                    paddingHorizontal: 8,
                    borderBottomWidth: index % 5 === 4 ? 1 : 0.2,
                    borderBottomColor: index % 5 === 4 ? "#666" : Colors.grey50,
                  }}
                />
              )}
              flexMigration={true}
            />
          ) : null
        ) : (
          <ScrollView>
            <Text style={styles.formula}>{formula}</Text>
          </ScrollView>
        )}
        {!isEditMode && (
          <View style={styles.resultContainer}>
            <Text style={styles.numberOfFormulaParts}>
              ({formula.split("+").filter((value) => !!value).length}x)
            </Text>
            <Text style={styles.result}>{result}</Text>
          </View>
        )}
      </View>
      {!isEditMode && (
        <>
          <View
            style={[styles.middleButtons, { backgroundColor: "transparent" }]}
          >
            {renderPresetButtons()}
            {renderPriorityButtons()}
          </View>

          {renderSingleDigitButtons()}
        </>
      )}
    </View>
  );
};

export default Calculator;
