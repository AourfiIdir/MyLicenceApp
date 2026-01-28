import { Stack } from 'expo-router';

export default function ListsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="lists"
    >
      <Stack.Screen name="lists" />
      <Stack.Screen name="create" />
      <Stack.Screen name="[listId]" />
    </Stack>
  );
}