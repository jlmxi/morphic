/**
 * A JSON value can be a string, number, boolean, object, array, or null.
 */
 export type JSONValue =
 | null
 | string
 | number
 | boolean
 | { [key: string]: JSONValue }
 | JSONValue[];
