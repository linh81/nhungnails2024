import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors, ListItem as RnuiListItem } from "react-native-ui-lib";

const ListItem = ({
  onPress = () => {},
  leftComponent,
  mainComponent,
  rightComponent,
  hasChevron = false,
  style = {},
}: {
  onPress?: any;
  leftComponent?: any;
  mainComponent: any;
  rightComponent?: any;
  hasChevron?: boolean;
  style?: any;
}) => {
  return (
    <RnuiListItem
      onPress={onPress}
      style={{
        borderBottomWidth: 0.2,
        height: 54,
        borderColor: Colors.grey50,
        paddingHorizontal: 2,
        ...style,
      }}
    >
      {leftComponent && (
        <RnuiListItem.Part left containerStyle={{ marginHorizontal: 8 }}>
          {leftComponent}
        </RnuiListItem.Part>
      )}

      <RnuiListItem.Part
        middle
        containerStyle={{
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        {mainComponent}
      </RnuiListItem.Part>

      {rightComponent && (
        <RnuiListItem.Part right>{rightComponent}</RnuiListItem.Part>
      )}

      {hasChevron && (
        <RnuiListItem.Part right>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            style={{ marginRight: 12 }}
          />
        </RnuiListItem.Part>
      )}
    </RnuiListItem>
  );
};

export default ListItem;
