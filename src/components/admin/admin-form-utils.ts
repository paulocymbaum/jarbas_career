export function toFormState<T extends { id: number; archived: boolean }>(
  item: T,
): Omit<T, "id" | "archived"> {
  const { id: _id, archived: _archived, ...rest } = item;
  void _id;
  void _archived;
  return rest;
}
