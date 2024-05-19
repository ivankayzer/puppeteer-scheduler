class Frequency {
  static minutes = (minutes: number) => 60 * minutes;
  static hours = (hours: number) => hours * Frequency.minutes(60);
  static days = (days: number) => days * Frequency.hours(24);
  static seconds = (seconds: number) => seconds;
}

export default Frequency;
