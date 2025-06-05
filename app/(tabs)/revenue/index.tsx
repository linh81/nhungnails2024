import React, { useRef } from "react";
import {
  FlatList,
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { Calendar, CalendarProvider } from "react-native-calendars";

import {
  Button,
  Checkbox,
  Colors,
  Modal,
  Text,
  TextField,
  View,
} from "react-native-ui-lib";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  format,
  formatString,
  getFormattedStringFromDate,
  getParsedDateFromString,
} from "@/utils/dateUtils";
import { capitalize, padStart } from "@/utils/stringUtils";
import { getDaysInMonth, getDay, addMonths, subMonths } from "date-fns";
import { getRevenueData } from "@/utils/dataUtils";
import { Ionicons } from "@expo/vector-icons";
import { push, ref, update, getDatabase } from "@react-native-firebase/database";
import { useNavigation } from "expo-router";
import ListItem from "@/components/ListItem";
import Calculator from "../../../components/Calculator/Calculator";
import { useConvertedRevenue } from "@/hooks/useTables";
import { createKeyboardDismissHandler } from "@/utils/keyboardUtils";

export default function RevenueScreen() {
  const navigation = useNavigation();
  const { data: revenue } = useConvertedRevenue();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [data, setData] = useState<any>();
  const [markedDates, setMarkedDates] = useState<any>({});
  const [markedDatesList, setMarkedDatesList] = useState<any>([]);

  const [monthRevenueCash, setMonthRevenueCash] = useState(0);
  const [monthRevenueAtm, setMonthRevenueAtm] = useState(0);
  const [monthRevenueBank, setMonthRevenueBank] = useState(0);
  const [monthRevenueTotal, setMonthRevenueTotal] = useState(0);
  const [revenueCash, setRevenueCash] = useState(0);
  const [revenueAtm, setRevenueAtm] = useState(0);
  const [revenueBank, setRevenueBank] = useState(0);
  const [revenueSepay, setRevenueSepay] = useState(0);
  const [
    revenueNumberOfSepayTransactions,
    setRevenueNumberOfSepayTransactions,
  ] = useState(0);
  const [formulaAtm, setFormulaAtm] = useState("");
  const [formulaCash, setFormulaCash] = useState("");
  const [formulaBank, setFormulaBank] = useState("");
  const [isAtmVerified, setIsAtmVerified] = useState(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRevenueCashChanged, setIsRevenueCashChanged] =
    useState<boolean>(false);
  const [isRevenueAtmChanged, setIsRevenueAtmChanged] =
    useState<boolean>(false);
  const [isRevenueBankChanged, setIsRevenueBankChanged] =
    useState<boolean>(false);
  const [isRevenueSepayChanged, setIsRevenueSepayChanged] =
    useState<boolean>(false);
  const [
    isRevenueNumberOfSepayTransactionsChanged,
    setIsRevenueNumberOfSepayTransactionsChanged,
  ] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const [showListView, setShowListView] = useState<boolean>(false);
  const [calculatorType, setCalculatorType] = useState<string | null>(null);

  // Add refs for text fields
  const revenueCashRef = useRef<any>(null);
  const revenueAtmRef = useRef<any>(null);
  const revenueBankRef = useRef<any>(null);
  const revenueSepayRef = useRef<any>(null);
  const revenueTransactionsRef = useRef<any>(null);

  // Create keyboard dismiss handler
  const dismissKeyboardAndBlur = createKeyboardDismissHandler([
    revenueCashRef,
    revenueAtmRef,
    revenueBankRef,
    revenueSepayRef,
    revenueTransactionsRef,
  ]);

  useEffect(() => {
    if (!user?.userData.isAdmin || !revenue) return;

    const data = getRevenueData(revenue);
    setData(data);
  }, [revenue]);

  useEffect(() => {
    if (!data || !user?.userData.isAdmin) return;

    const visibleDays = Array.from(
      Array(getDaysInMonth(selectedDate)).keys()
    ).map(
      (key) => `${format(selectedDate, "yyyy-MM-")}${padStart(key + 1, 2, "0")}`
    );
    const values: any = visibleDays.reduce(
      (res: any, date: string) => {
        const dayRevenue = data[date];
        const isSunday =
          getDay(getParsedDateFromString(date, "yyyy-MM-dd")) === 0;

        return {
          markedDates: {
            ...res.markedDates,
            [date]: {
              selected: format(selectedDate, "yyyy-MM-dd") === date,
              dots: [
                {
                  key: "cash",
                  color: !!Number(dayRevenue?.revenueCash)
                    ? "green"
                    : isSunday
                      ? "transparent"
                      : "red",
                },
                {
                  key: "atm",
                  color:
                    !!Number(dayRevenue?.revenueAtm) ||
                      dayRevenue?.isAtmVerified
                      ? "green"
                      : isSunday
                        ? "transparent"
                        : "red",
                },
                {
                  ...(!!Number(dayRevenue?.revenueAtm) ||
                    dayRevenue?.isAtmVerified
                    ? {
                      key: "verified",
                      color: !!Number(dayRevenue?.isAtmVerified)
                        ? "green"
                        : isSunday
                          ? "transparent"
                          : "red",
                    }
                    : {}),
                },
              ],
            },
          },
          markedDatesList: [
            ...res.markedDatesList,
            {
              ...(dayRevenue || {
                date: formatString(date, "yyyy-MM-dd", "dd-MM-yyyy"),
              }),
              isSunday,
            },
          ],
          monthRevenueCash:
            res.monthRevenueCash + Number(dayRevenue?.revenueCash || 0),
          monthRevenueAtm:
            res.monthRevenueAtm + Number(dayRevenue?.revenueAtm || 0),
          monthRevenueBank:
            res.monthRevenueBank + Number(dayRevenue?.revenueBank || 0),
          monthRevenueTotal:
            res.monthRevenueTotal +
            Number(dayRevenue?.revenueCash || 0) +
            Number(dayRevenue?.revenueAtm || 0) +
            Number(dayRevenue?.revenueBank || 0),
        };
      },
      {
        markedDates: {},
        markedDatesList: [],
        monthRevenueCash: 0,
        monthRevenueAtm: 0,
        monthRevenueBank: 0,
        monthRevenueTotal: 0,
      }
    );

    setMarkedDates(values.markedDates);
    setMarkedDatesList(values.markedDatesList);

    setMonthRevenueCash(values.monthRevenueCash);
    setMonthRevenueAtm(values.monthRevenueAtm);
    setMonthRevenueBank(values.monthRevenueBank);
    setMonthRevenueTotal(values.monthRevenueTotal);

    const selectedDayRevenue = data[format(selectedDate, "yyyy-MM-dd")];

    setRevenueCash(Number(selectedDayRevenue?.revenueCash) || 0);
    setRevenueAtm(Number(selectedDayRevenue?.revenueAtm) || 0);
    setRevenueBank(Number(selectedDayRevenue?.revenueBank) || 0);
    setRevenueSepay(Number(selectedDayRevenue?.revenueSepay) || 0);
    setRevenueNumberOfSepayTransactions(
      Number(selectedDayRevenue?.revenueNumberOfSepayTransactions) || 0
    );
    setFormulaAtm(selectedDayRevenue?.formulaAtm || "");
    setFormulaCash(selectedDayRevenue?.formulaCash || "");
    setFormulaBank(selectedDayRevenue?.formulaBank || "");
    setIsAtmVerified(selectedDayRevenue?.isAtmVerified || false);
  }, [data, user, selectedDate]);

  const toggleListView = () => {
    setShowListView((showListView) => !showListView);
  };

  useEffect(() => {
    if (!user?.userData.isAdmin || !navigation) return;

    navigation.setOptions({
      headerRight: () => {
        return (
          <Ionicons
            name={showListView ? "calendar-clear" : "list"}
            color="white"
            size={20}
            onPress={toggleListView}
          />
        );
      },
    });
  }, [navigation, showListView]);

  const handleSelectDate = (date: any) => {
    setSelectedDate(getParsedDateFromString(date.dateString, "yyyy-MM-dd"));
    setIsSaved(false);
  };

  const handleRevenueCashChange = (text: string) => {
    const value = Number(text) || 0;

    if (value !== revenueCash) {
      setIsRevenueCashChanged(true);
      setRevenueCash(value);
    } else {
      setIsRevenueCashChanged(false);
    }
  };

  const handleRevenueAtmChange = (text: string) => {
    const value = Number(text) || 0;

    if (value !== revenueAtm) {
      setIsRevenueAtmChanged(true);
      setRevenueAtm(value);
    } else {
      setIsRevenueAtmChanged(false);
    }
  };

  const handleRevenueBankChange = (text: string) => {
    const value = Number(text) || 0;

    if (value !== revenueBank) {
      setIsRevenueBankChanged(true);
      setRevenueBank(value);
    } else {
      setIsRevenueBankChanged(false);
    }
  };

  const handleRevenueSepayChange = (text: string) => {
    const value = Number(text) || 0;

    if (value !== revenueSepay) {
      setIsRevenueSepayChanged(true);
      setRevenueSepay(value);
    } else {
      setIsRevenueSepayChanged(false);
    }
  };

  const handleRevenueNumberOfSepayTransactions = (text: string) => {
    const value = Number(text) || 0;

    if (value !== revenueNumberOfSepayTransactions) {
      setIsRevenueNumberOfSepayTransactionsChanged(true);
      setRevenueNumberOfSepayTransactions(value);
    } else {
      setIsRevenueNumberOfSepayTransactionsChanged(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const existingDay = data[format(selectedDate, "yyyy-MM-dd")];
    const values = {
      date: getFormattedStringFromDate(selectedDate),
      revenueAtm,
      revenueCash,
      revenueBank,
      revenueSepay,
      revenueNumberOfSepayTransactions,
      formulaAtm: formulaAtm || null,
      formulaCash: formulaCash || null,
      formulaBank: formulaBank || null,
      formula: null,
      isAtmVerified: isAtmVerified || null,
      numberOfAtmTransactions: !!formulaAtm
        ? formulaAtm.split("+").length
        : null,
    };

    try {
      if (!existingDay) {
        await push(ref(getDatabase(), "/revenue"), values);
      } else {
        await update(ref(getDatabase(), `/revenue/${existingDay.id}`), values);
      }

      // if (Number(revenueAtm) > 0 || Number(revenueCash) > 0) {
      //   await sendPushNotification({
      //     user: firebaseData.user.name,
      //     title: "Nhung Nails",
      //     body: `${firebaseData.user.name} heeft omzet voor ${format(
      //       selectedDate,
      //       "EEEEEE d MMM"
      //     )} ingevuld.`,
      //   });
      // }

      setIsRevenueCashChanged(false);
      setIsRevenueAtmChanged(false);
      setIsRevenueBankChanged(false);
      setIsRevenueSepayChanged(false);
      setIsRevenueNumberOfSepayTransactionsChanged(false);
      setIsSaved(true);
    } catch (error: any) {
      throw new Error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetIsAtmVerified = async (
    date: string,
    isAtmVerified: boolean
  ) => {
    const existingDay = data[formatString(date, "dd-MM-yyyy", "yyy-MM-dd")];
    try {
      await update(ref(getDatabase(), `/revenue/${existingDay.id}`), {
        isAtmVerified,
      });
    } catch (error: any) {
      throw new Error(error);
    }
  };

  const setPreviousMonth = () => {
    setSelectedDate(subMonths(selectedDate, 1));
  };

  const setNextMonth = () => {
    setSelectedDate(addMonths(selectedDate, 1));
  };

  const handleSubmitCalculator = ({
    formula,
    result,
    isAtmVerified,
  }: {
    formula: string;
    result: number;
    isAtmVerified: boolean;
  }) => {
    if (calculatorType === "cash") {
      setFormulaCash(formula);
      setRevenueCash(result);
    } else if (calculatorType === "atm") {
      setFormulaAtm(formula);
      setRevenueAtm(result);
      setIsAtmVerified(isAtmVerified);
    } else if (calculatorType === "bank") {
      setFormulaBank(formula);
      setRevenueBank(result);
    }
  };

  const renderHeader = () => {
    return (
      <View style={{ alignItems: "center" }}>
        <Text style={{ fontWeight: "bold" }}>{`${capitalize(
          format(selectedDate, "MMMM yyyy")
        )} - €${monthRevenueTotal}`}</Text>
        <Text
          style={{ fontSize: 12, fontStyle: "italic" }}
        >{`Contant € ${monthRevenueCash} / Pin € ${monthRevenueAtm} / Bank € ${monthRevenueBank}`}</Text>
      </View>
    );
  };

  const renderListRow = ({ item }: { item: any }) => {
    const isSaved = !!Number(item.revenueAtm) && !!Number(item.revenueCash);

    return (
      <ListItem
        onPress={() => setSelectedDate(getParsedDateFromString(item.date))}
        leftComponent={
          !!item ? (
            <Checkbox
              value={item.isAtmVerified}
              onValueChange={(value) => {
                handleSetIsAtmVerified(item.date, value);
              }}
            />
          ) : (
            <Ionicons
              name="close"
              size={24}
              color={!item.isSunday ? "yellow" : "transparent"}
            />
          )
        }
        mainComponent={
          <View
            style={{
              alignItems: "center",
            }}
          >
            <Text color={!isSaved && item.isSunday && "#a1a1a1"}>
              {capitalize(
                format(getParsedDateFromString(item.date), "EEEEEE dd MMM")
              )}
            </Text>
          </View>
        }
        rightComponent={
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            {!!Number(item?.revenueAtm) && (
              <View
                style={[
                  styles.column,
                  styles.sepayMatchColumn,
                  {
                    borderColor:
                      !!Number(item?.revenueAtm) &&
                        Number(item?.revenueAtm || 0) ===
                        Number(item?.revenueSepay || 0)
                        ? "green"
                        : item.isSunday
                          ? "transparent"
                          : !Number(item?.revenueAtm)
                            ? "transparent"
                            : "red",
                  },
                ]}
              />
            )}
            <View style={[styles.column, styles.atmSepayColumn]}>
              <View style={[styles.columnRow]}>
                <Text
                  style={[
                    styles.columnRowLabel,
                    {
                      color: !!Number(item?.revenueCash)
                        ? "green"
                        : !item.isSunday
                          ? "red"
                          : "#a1a1a1",
                      fontWeight: "bold",
                    },
                  ]}
                >
                  {"Contant:"}
                </Text>
                <Text
                  style={[
                    {
                      color: !!Number(item?.revenueCash)
                        ? "green"
                        : !item.isSunday
                          ? "red"
                          : "#a1a1a1",
                      fontWeight: "bold",
                    },
                    styles.valueLabel,
                  ]}
                >
                  {Number(item?.revenueCash) || "-"}
                </Text>
              </View>

              <View style={styles.columnRow}>
                <Text
                  style={[
                    styles.columnRowLabel,
                    {
                      color: !!Number(item?.revenueAtm)
                        ? "green"
                        : !item.isSunday
                          ? "red"
                          : "#a1a1a1",
                      fontWeight: !Number(item?.revenueBank)
                        ? "bold"
                        : "normal",
                    },
                  ]}
                >
                  Pin:{" "}
                </Text>
                <Text
                  style={[
                    {
                      color: !!Number(item?.revenueAtm)
                        ? "green"
                        : !item.isSunday
                          ? "red"
                          : "#a1a1a1",
                      fontWeight: !Number(item?.revenueBank)
                        ? "bold"
                        : "normal",
                    },
                    styles.valueLabel,
                  ]}
                >
                  {!!Number(item?.revenueAtm)
                    ? `${item.revenueAtm}${!!item.numberOfAtmTransactions || !!item.formulaAtm
                      ? ` (${item.numberOfAtmTransactions ||
                      item.formulaAtm.split("+").length
                      })`
                      : ""
                    }`
                    : "-"}
                </Text>
              </View>
              <View style={styles.columnRow}>
                <Text
                  style={[
                    styles.columnRowLabel,
                    {
                      color: !!Number(item?.revenueSepay)
                        ? "green"
                        : !item.isSunday
                          ? "red"
                          : "#a1a1a1",
                    },
                  ]}
                >
                  Sepay:{" "}
                </Text>
                <Text
                  style={[
                    {
                      color: !!Number(item?.revenueSepay)
                        ? "green"
                        : !item.isSunday
                          ? "red"
                          : "#a1a1a1",
                    },
                    styles.valueLabel,
                  ]}
                >
                  {!!Number(item?.revenueSepay)
                    ? `${item.revenueSepay}${item.revenueNumberOfSepayTransactions
                      ? ` (${item.revenueNumberOfSepayTransactions})`
                      : ""
                    }`
                    : "-"}
                </Text>
              </View>
              {!!Number(item?.revenueBank) && (
                <View
                  style={[
                    styles.columnRow,
                    { borderWidth: 1, borderColor: "transparent" },
                  ]}
                >
                  <Text
                    style={[
                      styles.columnRowLabel,
                      {
                        color:
                          !!Number(item?.revenueBank) || item?.isAtmVerified
                            ? "green"
                            : "#a1a1a1",
                      },
                    ]}
                  >
                    Bank:{" "}
                  </Text>
                  <Text
                    style={[
                      {
                        color:
                          !!Number(item?.revenueBank) || item?.isAtmVerified
                            ? "green"
                            : "#a1a1a1",
                      },
                      styles.valueLabel,
                    ]}
                  >
                    {item.revenueBank || "-"}
                  </Text>
                </View>
              )}
              {!!Number(item?.revenueBank) && (
                <View
                  style={[
                    styles.columnRow,
                    { borderWidth: 1, borderColor: "transparent" },
                  ]}
                >
                  <Text
                    style={[
                      styles.columnRowLabel,
                      {
                        color:
                          !!Number(item?.revenueAtm) || item?.isAtmVerified
                            ? "green"
                            : !item.isSunday
                              ? "red"
                              : "#a1a1a1",
                        fontWeight: "bold",
                      },
                    ]}
                  >
                    Totaal pin:{" "}
                  </Text>
                  <Text
                    style={[
                      {
                        color:
                          !!Number(item?.revenueAtm) || item?.isAtmVerified
                            ? "green"
                            : !item.isSunday
                              ? "red"
                              : "#a1a1a1",
                        fontWeight: "bold",
                      },
                      styles.valueLabel,
                    ]}
                  >
                    {Number(item?.revenueAtm || 0) +
                      Number(item?.revenueBank || 0) || "-"}
                  </Text>
                </View>
              )}
            </View>

            <View style={[styles.column, styles.totalColumn]}>
              <View style={styles.columnRow}>
                <Text
                  style={{
                    color: isSaved
                      ? "green"
                      : !item.isSunday
                        ? "red"
                        : "#a1a1a1",
                    fontSize: 18,
                  }}
                >
                  {(Number(item?.revenueCash) || 0) +
                    (Number(item?.revenueAtm) || 0) +
                    (Number(item?.revenueBank) || 0) || "-"}
                </Text>
              </View>
            </View>
          </View>
        }
        style={{
          height: !!Number(item?.revenueBank) ? 95 : 60,
          backgroundColor:
            getFormattedStringFromDate(selectedDate) === item?.date
              ? "#dedede"
              : "#fff",
        }}
      />
    );
  };

  if (!user?.userData?.isAdmin) return null;

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboardAndBlur} accessible={false}>
      <View style={styles.container}>
        {!showListView ? (
          <>
            <CalendarProvider
              date={format(selectedDate, "yyyy-MM-dd")}
              style={{
                maxHeight: 300,
                // height: 300,
              }}
            >
              <Calendar
                firstDay={1}
                renderHeader={renderHeader}
                markedDates={markedDates}
                enableSwipeMonths
                onDayPress={handleSelectDate}
                onMonthChange={handleSelectDate}
                hideArrows={true}
                markingType={"multi-dot"}
              />
            </CalendarProvider>
          </>
        ) : (
          <>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: Colors.white,
                paddingVertical: 8,
                paddingHorizontal: 16,
              }}
            >
              <Ionicons
                name="arrow-back-circle-outline"
                size={32}
                onPress={setPreviousMonth}
              />
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontWeight: "bold" }}>{`${capitalize(
                  format(selectedDate, "MMMM yyyy")
                )} - €${monthRevenueTotal}`}</Text>
                <Text
                  style={{ fontSize: 12, fontStyle: "italic" }}
                >{`Contant € ${monthRevenueCash} / Pin € ${monthRevenueAtm} / Bank € ${monthRevenueBank}`}</Text>
              </View>
              {/* <Text>{capitalize(format(selectedDate, "MMMM yyyy"))}</Text> */}

              <Ionicons
                name="arrow-forward-circle-outline"
                size={32}
                onPress={setNextMonth}
              />
            </View>
            <ListItem
              mainComponent={
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginLeft: 40,
                  }}
                >
                  <Text style={{ fontSize: 12 }}>Datum</Text>
                </View>
              }
              rightComponent={
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                  }}
                >
                  <View style={[styles.column, styles.totalColumn]}>
                    <Text style={{ fontSize: 12 }}>Totaal</Text>
                  </View>
                </View>
              }
              style={{ height: 30 }}
            />
            <FlatList
              data={markedDatesList}
              renderItem={renderListRow}
            ></FlatList>
          </>
        )}
        <View
          style={[styles.row, { flexDirection: "row", borderTopWidth: 0.2 }]}
        >
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>
            {capitalize(format(selectedDate, "eeee dd MMMM yyyy"))}
          </Text>
          <Text>{`€ ${(Number(revenueCash) || 0) + (Number(revenueAtm) || 0) + (Number(revenueBank) || 0)}`}</Text>
        </View>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <TextField
              ref={revenueCashRef}
              value={String(revenueCash || 0)}
              onChangeText={handleRevenueCashChange}
              onSubmitEditing={dismissKeyboardAndBlur}
              returnKeyType="done"
              labelColor={
                isRevenueCashChanged ? "orange" : isSaved ? "green" : "#000"
              }
              label="Contant (€)"
              style={{ fontSize: showListView ? 14 : 16 }}
              labelStyle={{ fontSize: showListView ? 12 : 14 }}
              keyboardType="number-pad"
            />
          </View>
          <Ionicons
            size={24}
            name="calculator"
            onPress={() => setCalculatorType("cash")}
          />
        </View>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <TextField
              ref={revenueAtmRef}
              value={String(revenueAtm || 0)}
              onChangeText={handleRevenueAtmChange}
              onSubmitEditing={dismissKeyboardAndBlur}
              returnKeyType="done"
              labelColor={
                isRevenueAtmChanged ? "orange" : isSaved ? "green" : "#000"
              }
              label="Pin (€)"
              style={{ fontSize: showListView ? 14 : 16 }}
              labelStyle={{ fontSize: showListView ? 12 : 14 }}
              keyboardType="number-pad"
            />
          </View>
          <Ionicons
            size={24}
            name="calculator"
            onPress={() => setCalculatorType("atm")}
          />
        </View>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <TextField
              ref={revenueBankRef}
              value={String(revenueBank || 0)}
              onChangeText={handleRevenueBankChange}
              onSubmitEditing={dismissKeyboardAndBlur}
              returnKeyType="done"
              labelColor={
                isRevenueBankChanged ? "orange" : isSaved ? "green" : "#000"
              }
              label="Bank Nhung Nails (€)"
              style={{ fontSize: showListView ? 14 : 16 }}
              labelStyle={{ fontSize: showListView ? 12 : 14 }}
              keyboardType="number-pad"
            />
          </View>
          <Ionicons
            size={24}
            name="calculator"
            onPress={() => setCalculatorType("bank")}
          />
        </View>
        {showListView && (
          <View style={styles.row}>
            <View style={{ flexDirection: "row" }}>
              <View style={{ flex: 1 }}>
                <TextField
                  ref={revenueSepayRef}
                  value={String(revenueSepay || 0)}
                  onChangeText={handleRevenueSepayChange}
                  onSubmitEditing={dismissKeyboardAndBlur}
                  returnKeyType="done"
                  labelColor={
                    isRevenueSepayChanged
                      ? "orange"
                      : isSaved
                        ? "green"
                        : "#000"
                  }
                  label="Sepay (€)"
                  style={{ fontSize: showListView ? 14 : 16 }}
                  labelStyle={{ fontSize: showListView ? 12 : 14 }}
                  keyboardType="number-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextField
                  ref={revenueTransactionsRef}
                  value={String(revenueNumberOfSepayTransactions || 0)}
                  onChangeText={handleRevenueNumberOfSepayTransactions}
                  onSubmitEditing={dismissKeyboardAndBlur}
                  returnKeyType="done"
                  labelColor={
                    isRevenueNumberOfSepayTransactionsChanged
                      ? "orange"
                      : isSaved
                        ? "green"
                        : "#000"
                  }
                  label="Aantal Sepay transacties"
                  style={{ fontSize: showListView ? 14 : 16 }}
                  labelStyle={{ fontSize: showListView ? 12 : 14 }}
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </View>
        )}
        <View style={{ padding: 16 }}>
          <Button
            label="Opslaan"
            onPress={handleSubmit}
            disabled={
              isLoading
              // ||
              // (!isRevenueCashChanged &&
              //   !isRevenueAtmChanged &&
              //   !isRevenueBankChanged)
            }
            backgroundColor={
              isRevenueCashChanged ||
                isRevenueAtmChanged ||
                isRevenueBankChanged ||
                isRevenueSepayChanged ||
                isRevenueNumberOfSepayTransactionsChanged
                ? "orange"
                : Colors.tintColorLight
            }
          />
        </View>
        <Modal
          visible={calculatorType !== null}
          onBackgroundPress={() => setCalculatorType(null)}
        >
          <Calculator
            headerTitle={capitalize(format(selectedDate, "eeee dd MMM yyyy"))}
            onSubmit={handleSubmitCalculator}
            onClose={() => setCalculatorType(null)}
            formula={
              calculatorType === "cash"
                ? formulaCash
                : calculatorType === "atm"
                  ? formulaAtm
                  : calculatorType === "bank"
                    ? formulaBank
                    : ""
            }
            result={
              calculatorType === "cash"
                ? revenueCash
                : calculatorType === "atm"
                  ? revenueAtm
                  : calculatorType === "bank"
                    ? revenueBank
                    : 0
            }
            isAtmVerified={
              calculatorType === "atm" ? isAtmVerified || false : null
            }
          />
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  row: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 0.2,
    borderColor: Colors.grey50,
  },
  column: {
    // justifyContent: "flex-end",
    // paddingVertical: 4,
    // marginHorizontal: 4,
  },
  columnRow: {
    flexDirection: "row",
    // borderWidth: 1,
    // justifyContent: "space-between",
  },
  columnRowLabel: {
    fontSize: 12,
    width: 80,
  },
  valueLabel: {
    fontSize: 12,
  },
  totalColumn: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
  },
  sepayMatchColumn: {
    height: 26,
    top: 16,
    borderWidth: 1,
    borderColor: "red",
    marginRight: 4,
  },
  atmSepayColumn: {
    // flex: 1,
    width: 160,
    // marginRight: 12,
  },
  atmCashColumn: {
    // width: 95,
    marginRight: 8,
  },
});
