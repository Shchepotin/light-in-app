function prependZero(number: number): string {
  return number <= 9 ? "0" + number : number.toString();
}

export default prependZero;
